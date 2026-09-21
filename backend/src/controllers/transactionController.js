const { parse } = require("csv-parse/sync");
const pool = require("../config/db");
const { categorize } = require("../utils/categorize");
const { transactionHash } = require("../utils/hash");

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

function normalizeRow(row) {
  const data = {};

  Object.keys(row).forEach((key) => {
    const newKey = key.trim().toLowerCase().replace(/[\s_-]/g, "");
    data[newKey] = String(row[key] || "").trim();
  });

  return {
    date: data.date || data.transactiondate,
    description: data.description || data.narration || data.details,
    amount: data.amount,
    type: (data.type || data.transactiontype || "DEBIT").toUpperCase()
  };
}

function validDate(date) {
  if (!dateRegex.test(date)) return false;

  const value = new Date(`${date}T00:00:00Z`);
  return !isNaN(value.getTime()) && value.toISOString().startsWith(date);
}

function getFilters(req) {
  const conditions = ["t.user_id = $1"];
  const params = [];

  if (dateRegex.test(req.query.from || "")) {
    params.push(req.query.from);
    conditions.push(`t.transaction_date >= $${params.length + 1}`);
  }

  if (dateRegex.test(req.query.to || "")) {
    params.push(req.query.to);
    conditions.push(`t.transaction_date <= $${params.length + 1}`);
  }

  if (req.query.search) {
    params.push(`%${req.query.search.trim()}%`);
    conditions.push(
      `LOWER(t.description) LIKE LOWER($${params.length + 1})`
    );
  }

  return {
    conditions: conditions.join(" AND "),
    params
  };
}

async function uploadTransactions(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file is required" });
  }

  let rows;

  try {
    rows = parse(req.file.buffer.toString("utf8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });
  } catch (error) {
    return res.status(400).json({ message: "Invalid CSV file" });
  }

  if (!rows.length) {
    return res.status(400).json({ message: "CSV contains no transactions" });
  }

  if (rows.length > 10000) {
    return res.status(400).json({
      message: "Maximum 10,000 transactions allowed"
    });
  }

  const upload = await pool.query(
    `INSERT INTO uploads(user_id, filename, status)
     VALUES($1, $2, 'processing')
     RETURNING id`,
    [req.user.id, req.file.originalname]
  );

  const uploadId = upload.rows[0].id;

  const client = await pool.connect();

  let inserted = 0;
  let duplicates = 0;
  let invalid = 0;

  try {
    await client.query("BEGIN");

    const categories = await client.query(
      "SELECT id, name FROM categories"
    );

    const categoryMap = new Map();

    categories.rows.forEach((category) => {
      categoryMap.set(category.name, category.id);
    });

    for (const row of rows) {
      const transaction = normalizeRow(row);

      const amount = Number(
        String(transaction.amount || "").replace(/,/g, "")
      );

      const isValid =
        transaction.date &&
        validDate(transaction.date) &&
        transaction.description &&
        Number.isFinite(amount) &&
        amount >= 0 &&
        ["DEBIT", "CREDIT"].includes(transaction.type);

      if (!isValid) {
        invalid++;
        continue;
      }

      const category = categorize(transaction.description);

      const hash = transactionHash({
        date: transaction.date,
        description: transaction.description,
        amount,
        type: transaction.type
      });

      const result = await client.query(
        `INSERT INTO transactions
        (user_id, upload_id, category_id, transaction_date,
         description, amount, transaction_type, transaction_hash)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT(user_id, transaction_hash) DO NOTHING`,
        [
          req.user.id,
          uploadId,
          categoryMap.get(category),
          transaction.date,
          transaction.description,
          amount,
          transaction.type,
          hash
        ]
      );

      if (result.rowCount === 1) {
        inserted++;
      } else {
        duplicates++;
      }
    }

    await client.query(
      `UPDATE uploads
       SET status = 'completed', total_records = $1
       WHERE id = $2`,
      [inserted, uploadId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "CSV processed successfully",
      uploadId,
      inserted,
      duplicates,
      invalid
    });
  } catch (error) {
    await client.query("ROLLBACK");

    await pool.query(
      "UPDATE uploads SET status = 'failed' WHERE id = $1",
      [uploadId]
    );

    console.error(error);

    res.status(500).json({
      message: "Unable to process CSV"
    });
  } finally {
    client.release();
  }
}

async function listTransactions(req, res) {
  const { conditions, params } = getFilters(req);

  const limit = Math.min(
    Math.max(Number(req.query.limit) || 100, 1),
    500
  );

  const limitParam = params.length + 2;

  const result = await pool.query(
    `SELECT
       t.id,
       t.transaction_date,
       t.description,
       t.amount,
       t.transaction_type,
       c.name AS category
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${conditions}
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT $${limitParam}`,
    [req.user.id, ...params, limit]
  );

  res.json({
    transactions: result.rows
  });
}

async function summary(req, res) {
  const { conditions, params } = getFilters(req);

  const result = await pool.query(
    `SELECT
       COALESCE(
         SUM(CASE WHEN transaction_type = 'DEBIT'
         THEN amount ELSE 0 END), 0
       ) AS total_expenses,

       COALESCE(
         SUM(CASE WHEN transaction_type = 'CREDIT'
         THEN amount ELSE 0 END), 0
       ) AS total_income,

       COUNT(*) AS transaction_count

     FROM transactions t
     WHERE ${conditions}`,
    [req.user.id, ...params]
  );

  res.json({
    summary: result.rows[0]
  });
}

async function categories(req, res) {
  const { conditions, params } = getFilters(req);

  const result = await pool.query(
    `SELECT
       c.name AS category,
       SUM(t.amount) AS amount,
       COUNT(t.id) AS transaction_count
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE ${conditions}
       AND t.transaction_type = 'DEBIT'
     GROUP BY c.name
     ORDER BY amount DESC`,
    [req.user.id, ...params]
  );

  res.json({
    categories: result.rows
  });
}

async function monthly(req, res) {
  const { conditions, params } = getFilters(req);

  const result = await pool.query(
    `SELECT
       TO_CHAR(
         DATE_TRUNC('month', t.transaction_date),
         'YYYY-MM'
       ) AS month,

       SUM(
         CASE WHEN t.transaction_type = 'DEBIT'
         THEN t.amount ELSE 0 END
       ) AS expenses,

       SUM(
         CASE WHEN t.transaction_type = 'CREDIT'
         THEN t.amount ELSE 0 END
       ) AS income

     FROM transactions t
     WHERE ${conditions}
     GROUP BY DATE_TRUNC('month', t.transaction_date)
     ORDER BY month`,
    [req.user.id, ...params]
  );

  res.json({
    monthly: result.rows
  });
}

module.exports = {
  uploadTransactions,
  listTransactions,
  summary,
  categories,
  monthly
};