import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { LemonadeStand, type Supplies } from "./index";

// readline 
const rl = createInterface({ input: stdin, output: stdout });
const stand = new LemonadeStand();

// "$1.50" 
function money(cents: number): string {
    return "$" + (cents / 100).toFixed(2);
}

function show(s: Supplies): string {
    return `cups ${s.cups}, ice ${s.ice}, lemons ${s.lemons}, sugar ${s.sugar}`;
}

// ask the user how much left
async function askNumber(name: string): Promise<number> {
    while (true) {
        const answer = await rl.question(`Buy how many ${name}? `);
        const n = Number(answer);
        if (answer.trim() !== "" && Number.isInteger(n) && n >= 0) {
            return n;
        }
        console.log("Please enter a whole number (0 or more).");
    }
}

// ask price for each cup（input dollars -> cents）
async function askPrice(): Promise<number> {
    while (true) {
        const answer = await rl.question("Selling price per cup in dollars (e.g. 2.00): ");
        const dollars = Number(answer);
        if (answer.trim() !== "" && dollars > 0) {
            return Math.round(dollars * 100);
        }
        console.log("Please enter a number bigger than 0.");
    }
}

async function main(): Promise<void> {
    console.log("=== Lemonade Stand ===");
    console.log("Each cup uses: 1 cup, 2 ice, 1 lemon, 2 sugar");
    console.log("Starting cash: " + money(stand.cash));

    while (true) {
        const today = stand.getToday();
        console.log(`\n--- Day ${stand.day}: ${today.weather} ---`);
        console.log("Cash: " + money(stand.cash));
        console.log("Inventory: " + show(stand.inventory.items));
        console.log(
            `Prices: cups ${money(today.prices.cups)}, ice ${money(today.prices.ice)}, ` +
            `lemons ${money(today.prices.lemons)}, sugar ${money(today.prices.sugar)}`
        );

        const choice = await rl.question("Press Enter to play, or type q to quit: ");
        if (choice.trim().toLowerCase() === "q") {
            break;
        }

        // buy the ingredient
        let bought = false;
        while (bought === false) {
            const purchase: Supplies = {
                cups: await askNumber("cups"),
                ice: await askNumber("ice"),
                lemons: await askNumber("lemons"),
                sugar: await askNumber("sugar"),
            };
            try {
                const cost = stand.buy(purchase);
                console.log(`Spent ${money(cost)}.`);
                bought = true;
            } catch (e) {
                console.log("Not enough cash, try again.");
            }
        }

        const price = await askPrice();
        const result = stand.runDay(price);

        console.log(`Sold ${result.sold} cups, revenue ${money(result.revenue)}`);
        console.log("Supplies left: " + show(result.remaining));
        console.log("Cash: " + money(result.cash));
    }

    console.log("Game over! Final cash: " + money(stand.cash));
    rl.close();
}

main();
