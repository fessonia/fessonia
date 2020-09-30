declare const _exports: {
    [n: number]: {
        text: string;
        time: string;
    };
    length: number;
    toString(): string;
    toLocaleString(): string;
    pop(): {
        text: string;
        time: string;
    };
    push(...items: {
        text: string;
        time: string;
    }[]): number;
    concat(...items: ConcatArray<{
        text: string;
        time: string;
    }>[]): {
        text: string;
        time: string;
    }[];
    concat(...items: ({
        text: string;
        time: string;
    } | ConcatArray<{
        text: string;
        time: string;
    }>)[]): {
        text: string;
        time: string;
    }[];
    join(separator?: string): string;
    reverse(): {
        text: string;
        time: string;
    }[];
    shift(): {
        text: string;
        time: string;
    };
    slice(start?: number, end?: number): {
        text: string;
        time: string;
    }[];
    sort(compareFn?: (a: {
        text: string;
        time: string;
    }, b: {
        text: string;
        time: string;
    }) => number): {
        text: string;
        time: string;
    }[];
    splice(start: number, deleteCount?: number): {
        text: string;
        time: string;
    }[];
    splice(start: number, deleteCount: number, ...items: {
        text: string;
        time: string;
    }[]): {
        text: string;
        time: string;
    }[];
    unshift(...items: {
        text: string;
        time: string;
    }[]): number;
    indexOf(searchElement: {
        text: string;
        time: string;
    }, fromIndex?: number): number;
    lastIndexOf(searchElement: {
        text: string;
        time: string;
    }, fromIndex?: number): number;
    every<S extends {
        text: string;
        time: string;
    }>(predicate: (value: {
        text: string;
        time: string;
    }, index: number, array: {
        text: string;
        time: string;
    }[]) => value is S, thisArg?: any): this is S[];
    every(predicate: (value: {
        text: string;
        time: string;
    }, index: number, array: {
        text: string;
        time: string;
    }[]) => unknown, thisArg?: any): boolean;
    some(predicate: (value: {
        text: string;
        time: string;
    }, index: number, array: {
        text: string;
        time: string;
    }[]) => unknown, thisArg?: any): boolean;
    forEach(callbackfn: (value: {
        text: string;
        time: string;
    }, index: number, array: {
        text: string;
        time: string;
    }[]) => void, thisArg?: any): void;
    map<U>(callbackfn: (value: {
        text: string;
        time: string;
    }, index: number, array: {
        text: string;
        time: string;
    }[]) => U, thisArg?: any): U[];
    filter<S_1 extends {
        text: string;
        time: string;
    }>(predicate: (value: {
        text: string;
        time: string;
    }, index: number, array: {
        text: string;
        time: string;
    }[]) => value is S_1, thisArg?: any): S_1[];
    filter(predicate: (value: {
        text: string;
        time: string;
    }, index: number, array: {
        text: string;
        time: string;
    }[]) => unknown, thisArg?: any): {
        text: string;
        time: string;
    }[];
    reduce(callbackfn: (previousValue: {
        text: string;
        time: string;
    }, currentValue: {
        text: string;
        time: string;
    }, currentIndex: number, array: {
        text: string;
        time: string;
    }[]) => {
        text: string;
        time: string;
    }): {
        text: string;
        time: string;
    };
    reduce(callbackfn: (previousValue: {
        text: string;
        time: string;
    }, currentValue: {
        text: string;
        time: string;
    }, currentIndex: number, array: {
        text: string;
        time: string;
    }[]) => {
        text: string;
        time: string;
    }, initialValue: {
        text: string;
        time: string;
    }): {
        text: string;
        time: string;
    };
    reduce<U_1>(callbackfn: (previousValue: U_1, currentValue: {
        text: string;
        time: string;
    }, currentIndex: number, array: {
        text: string;
        time: string;
    }[]) => U_1, initialValue: U_1): U_1;
    reduceRight(callbackfn: (previousValue: {
        text: string;
        time: string;
    }, currentValue: {
        text: string;
        time: string;
    }, currentIndex: number, array: {
        text: string;
        time: string;
    }[]) => {
        text: string;
        time: string;
    }): {
        text: string;
        time: string;
    };
    reduceRight(callbackfn: (previousValue: {
        text: string;
        time: string;
    }, currentValue: {
        text: string;
        time: string;
    }, currentIndex: number, array: {
        text: string;
        time: string;
    }[]) => {
        text: string;
        time: string;
    }, initialValue: {
        text: string;
        time: string;
    }): {
        text: string;
        time: string;
    };
    reduceRight<U_2>(callbackfn: (previousValue: U_2, currentValue: {
        text: string;
        time: string;
    }, currentIndex: number, array: {
        text: string;
        time: string;
    }[]) => U_2, initialValue: U_2): U_2;
};
export = _exports;
