let iceCreamFlavors = [
{ name: "Chocolate", type: "Chocolate", price: 2},
{ name: "Strawberry", type: "Fruit", price: 1},
{ name: "Vanilla", type: "Vanilla", price: 2},
{ name: "Pistachio", type: "Nuts", price: 1.5},
{ name: "Neapolitan", type: "Chocolate", price: 2},
{ name: "Mint Chip", type: "Chocolate", price: 1.5},
{ name: "Raspberry", type: "Fruit", price: 1},
];
let transactions = []
// 주석
transactions.push({ scoops: ["Chocolate", "Vanilla", "Mint Chip"], total: 5.5 })
transactions.push({ scoops: ["Raspberry", "StrawBerry"], total: 2 })
transactions.push({ scoops: ["Vanilla", "Vanilla"], total: 4 })

let flavorDistribution = transactions.reduce((acc, curr) => {
curr.scoops.forEach(scoop => {
if (!acc[scoop]) {
acc[scoop] = 0;
}
acc[scoop]++;
})
return acc;
}, {}) 
let keys = Object.keys(flavorDistribution)
let val = Object.values(flavorDistribution)
let max = 0;

for (let i = 0; i < val.length; ++i)
{
    if(max < val[i])
    {
        max = i;
    }
}
console.log(flavorDistribution)
console.log(keys[max])