export type Supplies = {
    cups: number;
    ice: number;
    lemons: number;
    sugar: number;
};

export const names: (keyof Supplies)[] = ["cups", "ice", "lemons", "sugar"];

export class Recipe {
    ingredients: Supplies = { cups: 1, ice: 2, lemons: 1, sugar: 2 };
}

export class Inventory {
    items: Supplies = { cups: 0, ice: 0, lemons: 0, sugar: 0 };

    add(purchase: Supplies): void {
        for (const name of names) {
            this.items[name] = this.items[name] + purchase[name];
        }
    }

    canMake(recipe: Recipe): boolean {
        for (const name of names) {
            if (this.items[name] < recipe.ingredients[name]) {
                return false;
            }
        }
        return true;
    }

    use(recipe: Recipe): void {
        for (const name of names) {
            this.items[name] = this.items[name] - recipe.ingredients[name];
        }
    }
}

// the demand of the day
export type Today = {
    weather: string;
    demand: number;
    prices: Supplies;
};

// 一天结束后的结果
export type DayResult = {
    sold: number;
    revenue: number;
    cash: number;
    remaining: Supplies;
};

export class LemonadeStand {
    inventory: Inventory = new Inventory();
    recipe: Recipe = new Recipe();
    cash: number = 5000; // cents，5000 = $50
    day: number = 1;

    // Cool, Warm, Hot
    getToday(): Today {
        const type = (this.day - 1) % 3;
        if (type === 0) {
            return { weather: "Cool", demand: 8, prices: { cups: 10, ice: 5, lemons: 30, sugar: 8 } };
        } else if (type === 1) {
            return { weather: "Warm", demand: 12, prices: { cups: 12, ice: 6, lemons: 25, sugar: 9 } };
        } else {
            return { weather: "Hot", demand: 16, prices: { cups: 10, ice: 8, lemons: 35, sugar: 10 } };
        }
    }

    // the leftover money after buying the supply
    buy(purchase: Supplies): number {
        const prices = this.getToday().prices;
        let cost = 0;
        for (const name of names) {
            cost = cost + purchase[name] * prices[name];
        }
        if (cost > this.cash) {
            throw new Error("Not enough cash.");
        }
        this.cash = this.cash - cost;
        this.inventory.add(purchase);
        return cost;
    }

    // price for each cup（cents）
    runDay(price: number): DayResult {
        let demand = this.getToday().demand;

        if (price > 200) {
            demand = demand - Math.floor((price - 200) / 25);
        }
        if (demand < 0) {
            demand = 0;
        }

        // until sold out
        let sold = 0;
        while (sold < demand && this.inventory.canMake(this.recipe)) {
            this.inventory.use(this.recipe);
            this.cash = this.cash + price;
            sold = sold + 1;
        }

        this.day = this.day + 1;

        return {
            sold: sold,
            revenue: sold * price,
            cash: this.cash,
            remaining: { ...this.inventory.items },
        };
    }
}
