# ffmpeg-filtergraph

A node module for modeling and working with FFmpeg filtergraphs

(This is currently a work in progress.)

## FilterNode

To load the `FilterNode` module, use:

```{javascript}
const FilterNode = require('ffmpeg-filtergraph').FilterNode;
```

### FilterNode creation

To create a filter node in the graph, use:

```{javascript}
let myFilter = new FilterNode(alias = "my_filter", options = { ... });
```

The `options` object has the following format:

```{javascript}
{
  filterName: "...", // must be a filter name recognized by ffmpeg
  inputs: [{ alias: "input1", ... }, ...], // filter inputs (what ffmpeg calls LINKLABELS for input)
  outputs: [{ alias: "output1", ... }, ...], // filter outputs (what ffmpeg calls LINKLABELS for output)
  args: [
    "arg1",
    { "obj_arg2": "obj_arg_value" },
    { "obj_arg3": ["list", "valued", "value"] }
  ]
}
```

### Connecting FilterNode objects manually

To connect one FilterNode object to another in a sequence, you can either use the `connectNodes` method on `FilterNode`:

```{javascript}
let f1 = new FilterNode(alias = "filter_1", options = { ... });
let f2 = new FilterNode(alias = "filter_2", options = { ... });

FilterNode.connectNodes(f1, f2);

f1.nextNode // => FilterNode("filter_2", ...)
f2.previousNode // => FilterNode("filter_1", ...)
```

Or you can use the property assignment syntax on the object instance:

```{javascript}
let f1 = new FilterNode(alias = "filter_1", options = { ... });
let f2 = new FilterNode(alias = "filter_2", options = { ... });

f1.nextNode = f2;

f1.nextNode // => FilterNode("filter_2", ...)
f2.previousNode // => FilterNode("filter_1", ...)
```
