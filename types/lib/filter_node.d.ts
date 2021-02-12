export default FilterNode;

declare class FilterNode {
    args: FilterNode.Argument[];
    filterName: string;

    constructor(filterName: string, args?: FilterNode.Argument[] | keyValuePair);

    getOutputPad(specifier: number | string): string;
}

declare namespace FilterNode {
    export type Argument = stringOrNumber | Array<stringOrNumber | stringOrNumber[]> | keyValuePair;
}

interface keyValuePair {
    name: string;
    value: string | string[];
}
type stringOrNumber = string | number;
