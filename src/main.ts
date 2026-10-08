import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { LemonadeStand, type Supplies } from "./index";

const rl = createInterface({ input, output });
const stand = new LemonadeStand();

function money(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

function describeSupplies(supplies: Supplies): string {
    return `cups ${supplies.cups}, ice ${supplies.ice}, lemons ${supplies.lemons}, sugar ${supplies.sugar}`;
}

async function askQuantity(name: keyof Supplies): Promise<number> {
    while (true) {
        const answer = (await rl.question(`Buy how many ${name}? `)).trim();
        const amount = Number(answer);
        if (answer !== "" && Number.isSafeInteger(amount) && amount >= 0) {
            return amount;
        }
        console.log("Enter a nonnegative whole number.");
    }
}

async function askPrice(): Promise<number> {
    while (true) {
        const answer = (await rl.question("Selling price per cup ($): ")).trim();
        if (/^(?:\d+)(?:\.\d{1,2})?$/.test(answer)) {
            const cents = Math.round(Number(answer) * 100);
            if (Number.isSafeInteger(cents) && cents > 0) {
                return cents;
            }
        }
        console.log("Enter a positive dollar amount, such as 2.00.");
    }
}

async function main(): Promise<void> {
    console.log("Lemonade Stand");
    console.log("Recipe per cup: 1 cup, 2 ice, 1 lemon, 2 sugar.");
    console.log(`Starting cash: ${money(stand.cash)}. Enter q at the start of a day to quit.`);

    while (true) {
        const today = stand.today;
        console.log(`\nDay ${stand.day}: ${today.weather} weather`);
        console.log(`Cash: ${money(stand.cash)} | Inventory: ${describeSupplies(stand.inventory.remaining)}`);
        console.log(`Supply prices: cups ${money(today.prices.cups)}, ice ${money(today.prices.ice)}, lemons ${money(today.prices.lemons)}, sugar ${money(today.prices.sugar)} each`);
        const choice = (await rl.question("Press Enter to shop, or q to quit: ")).trim().toLowerCase();
        if (choice === "q") break;

        while (true) {
            const purchase: Supplies = {
                cups: await askQuantity("cups"),
                ice: await askQuantity("ice"),
                lemons: await askQuantity("lemons"),
                sugar: await askQuantity("sugar"),
            };
            try {
                const cost = stand.buy(purchase);
                console.log(`Spent ${money(cost)}. Cash left: ${money(stand.cash)}.`);
                break;
            } catch (error) {
                console.log((error as Error).message + " Try again.");
            }
        }

        const price = await askPrice();
        const result = stand.runDay(price);
        console.log(`Sold ${result.sold} cups for ${money(result.revenue)} revenue.`);
        console.log(`Supplies left: ${describeSupplies(result.remaining)}.`);
        console.log(`Cash balance: ${money(result.cash)}.`);
    }
    console.log(`Game over. Final cash: ${money(stand.cash)}.`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => rl.close());
