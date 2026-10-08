export type SupplyName = "cups" | "ice" | "lemons" | "sugar";
export type Supplies = Record<SupplyName, number>;

const supplyNames: SupplyName[] = ["cups", "ice", "lemons", "sugar"];

export class Inventory {
    private stock: Supplies = { cups: 0, ice: 0, lemons: 0, sugar: 0 };

    get remaining(): Supplies {
        return { ...this.stock };
    }

    add(purchase: Supplies): void {
        for (const name of supplyNames) {
            this.stock[name] += purchase[name];
        }
    }

    canMake(recipe: Recipe): boolean {
        return supplyNames.every(name => this.stock[name] >= recipe.ingredients[name]);
    }

    use(recipe: Recipe): void {
        if (!this.canMake(recipe)) {
            throw new Error("Not enough supplies to make a cup.");
        }
        for (const name of supplyNames) {
            this.stock[name] -= recipe.ingredients[name];
        }
    }
}

export class Recipe {
    // Units needed for one cup of lemonade.
    readonly ingredients: Supplies = { cups: 1, ice: 2, lemons: 1, sugar: 2 };
}

export type DayConditions = {
    weather: "Cool" | "Warm" | "Hot";
    demand: number;
    prices: Supplies; // cents per unit
};

export type DayResult = {
    sold: number;
    revenue: number;
    cash: number;
    remaining: Supplies;
};

const conditions: DayConditions[] = [
    { weather: "Cool", demand: 8, prices: { cups: 10, ice: 5, lemons: 30, sugar: 8 } },
    { weather: "Warm", demand: 12, prices: { cups: 12, ice: 6, lemons: 25, sugar: 9 } },
    { weather: "Hot", demand: 16, prices: { cups: 10, ice: 8, lemons: 35, sugar: 10 } },
];

export class LemonadeStand {
    readonly inventory = new Inventory();
    readonly recipe = new Recipe();
    cash = 5000; // cents
    day = 1;

    get today(): DayConditions {
        return conditions[(this.day - 1) % conditions.length];
    }

    costOf(purchase: Supplies): number {
        this.validateSupplies(purchase);
        return supplyNames.reduce((cost, name) => cost + purchase[name] * this.today.prices[name], 0);
    }

    buy(purchase: Supplies): number {
        const cost = this.costOf(purchase);
        if (cost > this.cash) {
            throw new Error("Not enough cash for that purchase.");
        }
        this.cash -= cost;
        this.inventory.add(purchase);
        return cost;
    }

    runDay(price: number): DayResult {
        if (!Number.isSafeInteger(price) || price <= 0) {
            throw new Error("Selling price must be a positive number of cents.");
        }
        // Each 25 cents above $2 lowers demand by one cup.
        const demand = Math.max(0, this.today.demand - Math.max(0, Math.floor((price - 200) / 25)));
        let sold = 0;
        while (sold < demand && this.inventory.canMake(this.recipe)) {
            this.inventory.use(this.recipe);
            this.cash += price;
            sold++;
        }
        this.day++;
        return { sold, revenue: sold * price, cash: this.cash, remaining: this.inventory.remaining };
    }

    private validateSupplies(purchase: Supplies): void {
        for (const name of supplyNames) {
            if (!Number.isSafeInteger(purchase[name]) || purchase[name] < 0) {
                throw new Error(`${name} must be a nonnegative whole number.`);
            }
        }
    }
}
