declare const _exports: {
    [n: number]: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    length: number;
    toString(): string;
    toLocaleString(): string;
    pop(): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    push(...items: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]): number;
    concat(...items: ConcatArray<{
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }>[]): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    concat(...items: ({
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    } | ConcatArray<{
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }>)[]): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    join(separator?: string): string;
    reverse(): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    shift(): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    slice(start?: number, end?: number): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    sort(compareFn?: (a: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, b: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }) => number): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    splice(start: number, deleteCount?: number): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    splice(start: number, deleteCount: number, ...items: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    unshift(...items: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]): number;
    indexOf(searchElement: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, fromIndex?: number): number;
    lastIndexOf(searchElement: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, fromIndex?: number): number;
    every<S extends {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }>(predicate: (value: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => value is S, thisArg?: any): this is S[];
    every(predicate: (value: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => unknown, thisArg?: any): boolean;
    some(predicate: (value: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => unknown, thisArg?: any): boolean;
    forEach(callbackfn: (value: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => void, thisArg?: any): void;
    map<U>(callbackfn: (value: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => U, thisArg?: any): U[];
    filter<S_1 extends {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }>(predicate: (value: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => value is S_1, thisArg?: any): S_1[];
    filter(predicate: (value: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, index: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => unknown, thisArg?: any): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[];
    reduce(callbackfn: (previousValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    reduce(callbackfn: (previousValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, initialValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    reduce<U_1>(callbackfn: (previousValue: U_1, currentValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => U_1, initialValue: U_1): U_1;
    reduceRight(callbackfn: (previousValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    reduceRight(callbackfn: (previousValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, initialValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }): {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    };
    reduceRight<U_2>(callbackfn: (previousValue: U_2, currentValue: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }, currentIndex: number, array: {
        frame: number;
        fps: number;
        q: number;
        size: string;
        time: number;
        bitrate: string;
        speed: string;
    }[]) => U_2, initialValue: U_2): U_2;
};
export = _exports;
