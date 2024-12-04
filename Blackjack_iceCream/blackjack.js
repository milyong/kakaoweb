let cardOne = Math.floor(Math.random() * 10)+2;
let cardTwo = Math.floor(Math.random() * 10)+2;
let cardOneBank = Math.floor(Math.random() * 10)+2;
let cardTwoBank = Math.floor(Math.random() * 10)+2;
let sum = cardOne+cardTwo;
let BankSum = cardOneBank+cardTwoBank;
console.log(`Player's cards: ${cardOne}, ${cardTwo}`);
console.log(`Banker's cards: ${cardOneBank}, ${cardTwoBank}`);
if(sum === 21){
    retern ="Your's Black Jack You Win";
}
if(BankSum === 21){
    console.log("Banker's Black Jack Bank Win");
}
while(BankSum < 17){
    BankSum += Math.floor(Math.random() * 10)+2;
    if(sum < 13){
        sum += Math.floor(Math.random() * 10)+2;
    }
        if(BankSum >= 17){
            break;
        }
        if(sum >= 17){
            break;
        }
}
if(BankSum > 21){
    console.log("burst You Win");
}
if(sum > 21){
    console.log("Burst Bank Win");
}
console.log(`You have ${sum} points`);
console.log(`Bank have ${BankSum} points`);
if(BankSum > 21){
    console.log("Burst You Win");
}
else if(sum > 21){
    console.log("Burst Bank Win");
}
else if (BankSum < sum){
    console.log("You Win");
}
else if(BankSum > sum){
    console.log("Bank Win");
}
else{
    console.log("Draw");
}

