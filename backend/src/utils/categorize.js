const rules=[
 ["Food",["swiggy","zomato","restaurant","cafe","dominos","mcdonald","food"]],
 ["Transport",["uber","ola","rapido","metro","petrol","fuel","parking"]],
 ["Shopping",["amazon","flipkart","myntra","reliance fresh","mall","shopping"]],
 ["Entertainment",["netflix","prime video","bookmyshow","spotify","movie"]],
 ["Utilities",["electricity","msedcl","water bill","gas bill","broadband","jio","airtel","recharge"]],
 ["Healthcare",["apollo","pharmacy","hospital","clinic","medicine","medicines"]],
 ["Travel",["makemytrip","booking.com","hotel","airlines","irctc","flight"]],
 ["Education",["udemy","coursera","college","school","education"]],
 ["Salary",["salary","payroll"]]
];
function categorize(description){const text=String(description||"").toLowerCase();for(const [category,keywords] of rules){if(keywords.some(k=>text.includes(k)))return category;}return "Others";}
module.exports={categorize};
