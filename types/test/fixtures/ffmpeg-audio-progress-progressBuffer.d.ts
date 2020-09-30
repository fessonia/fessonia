declare const _exports: {
    [n: number]: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    length: number;
    toString(): string;
    toLocaleString(): string;
    pop(): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    push(...items: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]): number;
    concat(...items: ConcatArray<{
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }>[]): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    concat(...items: ({
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    } | ConcatArray<{
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }>)[]): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    join(separator?: string): string;
    reverse(): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    shift(): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    slice(start?: number, end?: number): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    sort(compareFn?: (a: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, b: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }) => number): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    splice(start: number, deleteCount?: number): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    splice(start: number, deleteCount: number, ...items: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    unshift(...items: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]): number;
    indexOf(searchElement: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, fromIndex?: number): number;
    lastIndexOf(searchElement: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, fromIndex?: number): number;
    every<S extends {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }>(predicate: (value: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => value is S, thisArg?: any): this is S[];
    every(predicate: (value: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => unknown, thisArg?: any): boolean;
    some(predicate: (value: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => unknown, thisArg?: any): boolean;
    forEach(callbackfn: (value: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => void, thisArg?: any): void;
    map<U>(callbackfn: (value: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => U, thisArg?: any): U[];
    filter<S_1 extends {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }>(predicate: (value: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => value is S_1, thisArg?: any): S_1[];
    filter(predicate: (value: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => unknown, thisArg?: any): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    reduce(callbackfn: (previousValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    reduce(callbackfn: (previousValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, initialValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    reduce<U_1>(callbackfn: (previousValue: U_1, currentValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => U_1, initialValue: U_1): U_1;
    reduceRight(callbackfn: (previousValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    reduceRight(callbackfn: (previousValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, initialValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }): {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    reduceRight<U_2>(callbackfn: (previousValue: U_2, currentValue: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => U_2, initialValue: U_2): U_2;
};
export = _exports;
