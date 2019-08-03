This library was designed to make the composition of `ffmpeg` commands clearer and easier to understand.

## The Structure of an FFmpeg Command

FFmpeg **commands** are structured with several components:

- a collection of **inputs**, which may have *options*, and may make use of source *filters*
- a collection of **outputs**, which may have *options*, and may process media through *filters*
- **filter graphs**, which we'll also refer to more generally as **filters**, which may contain one or more *filter chains* composed of *filter nodes*, or one or more individual *filter nodes*
- **filter chains**, which are linear combinations of one or more *filter nodes*
- **filter nodes**, which represent single instances of given *filters*, and which may have several **arguments**
- **options**, which may apply at the *input* level, at the *output* level, or globally at the *command* level, and which may have an *argument* or *argument string*
- some set of **mappings** from output streams of *inputs* and *filters* to input stream indices of *outputs*

A single *command* wraps all of these in a chain of connections that represent a processing pipeline that takes the *inputs* and produces the *outputs*.

### An Example for Some Clarity

As an example, we can look at the following command:

```{bash}
ffmpeg -y -threads 8 -ss 5110.77 -i "/path/to/some/input.mov" -itsoffset 0 -ss 5110.77 -i "/path/to/some/input.mov" -acodec libfdk_aac -ac 1 -b:a 48k -vcodec libx264 -b:v 400k -filter:v "scale=640:-1,ass=filename=/path/to/some/subtitles.ass" -f mp4 -map 0:2 -map 1:0 -t 642.517 -movflags faststart -preset:v ultrafast -tune film -pix_fmt yuv420p -threads 8 "/path/to/output.mp4"
```

Taking this apart into the various components, we can see the following parts that make up this *command*:

- two *inputs*, each specifying the same file:
  - `-threads 8 -ss 5110.77 -i "/path/to/input.mov"` (with options `-threads 8` and `-ss 5110.77`)
  - `-itsoffset 0 -ss 5110.77 -i "/path/to/input.mov"` (with options `-itsoffset 0` and `-ss 5110.77`)
- one *output*: `-acodec libfdk_aac -ac 1 -b:a 48k -vcodec libx264 -b:v 400k -filter:v "scale=640:-1,ass=filename=/path/to/subtitles.ass" -f mp4 -map 0:2 -map 1:0 -t 642.517 -movflags faststart -preset:v ultrafast -tune film -pix_fmt yuv420p -threads 8 "/path/to/output.mp4"`, which has:
  - 13 *options*:
    - a `filter:v` *option* with a *filter graph* *argument string*: `"scale=640:-1,ass=filename=/path/to/subtitles.ass"`, containing a single *filter chain* with 2 *filter nodes*:
      - a `scale` *filter node* with arguments `640` and `-1`
      - an `ass` *filter node* with a named argument `filename` with value `/path/to/subtitles.ass`
    - 12 other *options*, most with single *arguments*
- two *mappings*:
  - `0:2`, mapping the stream index 2 (the third stream) of the first input (index 0) into the first stream of the output file (by ordering of the mappings)
  - `1:0`, mapping the stream index 0 (the first stream) of the second input (index 0) into the second stream of the output file (also by ordering of the mappings)
- one globally applied *option* `-y`

Deconstructing the command in this way, it becomes easier to see the processing pipeline, and how the command will work. This library attempts to use the clarity of this insight to help construct new commands in the same way.

## Visualizing the Structure of a Command

Sometimes a picture is helpful. We can visualize this hierarchical structure of an `ffmpeg` command as in the diagram below.

![FFmpeg command structure diagram](ffmpeg-command-hierarchy.png)

## How this Structure is Reflected in the Design of Fessonia

The Fessonia library is largely designed around this structure.

There is a class module for each major element in the structure of a command, with the exception of:

* **arguments**, which are modeled within `FFmpegOption` (a private class used internally for validation) and `FilterNode` as needed
* **filter chains**, which are not needed because all filter pipelines are modelled with explicit internal mappings as *filter graphs*
* **mappings** (currently a work-in-progress), which are modelled in the context of adding **outputs** to a **command**

When constructing a command, you first start with the components, then add them to the containing structures as needed, building up the command as in the diagram above. To see how this works in practice, take a look at the {@tutorial 0_getting_started} tutorial.

## About the Name Fessonia and the Butterfly Logo

The name Fessonia comes from the ancient Roman goddess Fessonia, apparently referenced by Augustine in his *City of God* (iv, 21), and [understood to be](https://pantheon.org/articles/f/fessonia.html)

> The goddess of weary persons, who is invoked to provide refreshment.

You can learn more about the goddess Fessonia, including some conjectures based on little evidence, at [her entry in the Obscure Goddess Online Dictionary](http://www.thaliatook.com/OGOD/fessonia.html).

What does that obscure goddess have to do with this library, you ask? Because the intent of this library was to provide refreshment from the author's weariness of dealing with FFmpeg command line invocations in his work of automating video encoding pipelines using FFmpeg, that name seemed quite fitting.

The logo (drawn digitally by the author) is a representation of [the butterfly *Adelpha f. fessonia*](https://www.butterfliesofamerica.com/adelpha_f_fessonia.htm), also known as the *Band-celled Sister*.
