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

    
}
