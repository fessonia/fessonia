This library was designed to make the composition of `ffmpeg` commands clearer and easier to understand.

## The Structure of an FFmpeg Command

FFmpeg **commands** are structured with several components:

- a collection of **inputs**, which may have *options*, and may make use of source *filters*
- a collection of **outputs**, which may have *options*, and may process media through *filters*
- a **filter graph**, which we'll also refer to more generally as **filters**, which may contain one or more *filter chains* composed of *filter nodes*, or one or more individual *filter nodes*
- **filter chains**, which are linear combinations of one or more *filter nodes*
- **filter nodes**, which represent single instances of given *filters*, and which may have several **arguments**
- **options**, which may apply at the *input* level, at the *output* level, or globally at the *command* level, and which may have an *argument* or *argument string*
- some set of **mappings** from output streams of *inputs* and *filters* into streams of *outputs*

A single *command* wraps all of these in a chain of connections that represent a processing pipeline that takes the *inputs* and produces the *outputs*.

### An Example for Some Clarity

As an example, we can look at the following command:

```{bash}
ffmpeg -y -threads 8 -ss 5110.77 -i "/path/to/some/input.mov" -itsoffset 0 -ss 5110.77 -i "/path/to/some/input.mov" -acodec libfdk_aac -ac 1 -b:a 48k -vcodec libx264 -b:v 400k -filter:v "scale=640:-1,subtitles=filename=/path/to/some/subtitles.srt" -f mp4 -map 0:2 -map 1:0 -t 642.517 -movflags faststart -preset:v ultrafast -tune film -pix_fmt yuv420p -threads 8 "/path/to/output.mp4"
```

Taking this apart into the various components, we can see the following parts that make up this *command*:

- two *inputs*, each specifying the same file:
  - `-threads 8 -ss 5110.77 -i "/path/to/input.mov"` (with options `-threads 8` and `-ss 5110.77`)
  - `-itsoffset 0 -ss 5110.77 -i "/path/to/input.mov"` (with options `-itsoffset 0` and `-ss 5110.77`)
- one *output*: `-acodec libfdk_aac -ac 1 -b:a 48k -vcodec libx264 -b:v 400k -filter:v "scale=640:-1,subtitles=filename=/path/to/subtitles.srt" -f mp4 -map 0:2 -map 1:0 -t 642.517 -movflags faststart -preset:v ultrafast -tune film -pix_fmt yuv420p -threads 8 "/path/to/output.mp4"`, which has:
  - 13 *options*:
    - a `filter:v` *option* with a *filter graph* *argument string*: `"scale=640:-1,subtitles=filename=/path/to/subtitles.srt"`, containing a single *filter chain* with 2 *filter nodes*:
      - a `scale` *filter node* with arguments `640` and `-1`
      - an `subtitles` *filter node* with a named argument `filename` with value `/path/to/subtitles.srt`
    - 12 other *options*, most with single *arguments*
- two *mappings*:
  - `0:2`, mapping the stream index 2 (the third stream) of the first input (index 0) into the first stream of the output file (by ordering of the mappings)
  - `1:0`, mapping the stream index 0 (the first stream) of the second input (index 1) into the second stream of the output file (also by ordering of the mappings)
- one globally applied *option* `-y`

Deconstructing the command in this way, it becomes easier to see the processing pipeline, and how the command will work. This library attempts to use the clarity of this insight to help construct new commands in the same way.

## Visualizing the Structure of a Command

Sometimes a picture is helpful. We can visualize this structure of an `ffmpeg` command as in the diagram below.

![FFmpeg command structure diagram](ffmpeg-command-diagram.png)

## How this Structure is Reflected in the Design of Fessonia

The Fessonia library is largely designed around this structure.

With the 5 interface classes, `FFmpegCommand`, `FFmpegInput`, `FFmpegOutput`, `FilterChain` and `FilterNode`, each major  element in the structure of a command is modeled.

For the remaining elements, internal classes are used, accessed only through methods on the public class objects:

* **filter graphs** - One is implicitly added to every `FFmpegCommand` object. You can add `FilterChain` objects to the filter graph using the `addFilterChain` method of `FFmpegCommand`. (private class `FilterGraph`)
* **arguments** - Created on the fly as you create other objects that use them. (private class `FFmpegOption`)
* **mappings** - Created by adding stream specifiers to FilterChain objects using the `addInputs` and `addInput` methods and to FFmpegOutput objects using the `addStream` and `addStreams` methods. Stream specifiers can be retrieved from `FFmpegInput` and `FilterChain` objects using the `streamSpecifier` method. (private class `FFmpegStreamSpecifier`)

When constructing a command, you first start with the components, then add them to the containing structures as needed, building up the command as in the diagram above. To see how this works in practice, take a look at the {@tutorial 0.0_getting_started} tutorial. For more detail on how stream specifiers and mappings work, take a look at the {@tutorial 0.1_stream_specifiers_mappings} tutorial.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<div id="contributors">
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://datascientist.guru"><img src="https://avatars0.githubusercontent.com/u/479496?v=4" width="100px;" alt="Ryan B. Harvey"/><br /><sub><b>Ryan B. Harvey</b></sub></a><br /><a href="https://github.com/fessonia/fessonia/commits?author=nihonjinrxs" title="Code">💻</a> <a href="https://github.com/fessonia/fessonia/commits?author=nihonjinrxs" title="Documentation">📖</a> <a href="#design-nihonjinrxs" title="Design">🎨</a> <a href="#example-nihonjinrxs" title="Examples">💡</a> <a href="#content-nihonjinrxs" title="Content">🖋</a> <a href="#ideas-nihonjinrxs" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-nihonjinrxs" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-nihonjinrxs" title="Maintenance">🚧</a> <a href="https://github.com/fessonia/fessonia/commits?author=nihonjinrxs" title="Tests">⚠️</a> <a href="#tutorial-nihonjinrxs" title="Tutorials">✅</a> <a href="#talk-nihonjinrxs" title="Talks">📢</a></td>
    <td align="center"><a href="http://www.ted.com/"><img src="https://avatars1.githubusercontent.com/u/267451?v=4" width="100px;" alt="Mark Bogdanoff"/><br /><sub><b>Mark Bogdanoff</b></sub></a><br /><a href="#ideas-bog" title="Ideas, Planning, & Feedback">🤔</a> <a href="#example-bog" title="Examples">💡</a> <a href="https://github.com/fessonia/fessonia/commits?author=bog" title="Code">💻</a> <a href="#review-bog" title="Reviewed Pull Requests">👀</a> <a href="#question-bog" title="Answering Questions">💬</a> <a href="https://github.com/fessonia/fessonia/issues?q=author%3Abog" title="Bug reports">🐛</a> <a href="#projectManagement-bog" title="Project Management">📆</a> <a href="#userTesting-bog" title="User Testing">📓</a> <a href="https://github.com/fessonia/fessonia/commits?author=bog" title="Tests">⚠️</a> <a href="#content-bog" title="Content">🖋</a> <a href="#design-bog" title="Design">🎨</a> <a href="#tutorial-bog" title="Tutorials">✅</a></td>
    <td align="center"><a href="http://redopop.com"><img src="https://avatars2.githubusercontent.com/u/109632?v=4" width="100px;" alt="Joe Bartlett"/><br /><sub><b>Joe Bartlett</b></sub></a><br /><a href="#ideas-redoPop" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-redoPop" title="Answering Questions">💬</a> <a href="#review-redoPop" title="Reviewed Pull Requests">👀</a> <a href="#content-redoPop" title="Content">🖋</a> <a href="#design-redoPop" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/griley"><img src="https://avatars0.githubusercontent.com/u/302162?v=4" width="100px;" alt="George Riley"/><br /><sub><b>George Riley</b></sub></a><br /><a href="#ideas-griley" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-griley" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://www.aaronweyenberg.com"><img src="https://avatars2.githubusercontent.com/u/39579?v=4" width="100px;" alt="Aaron Weyenberg"/><br /><sub><b>Aaron Weyenberg</b></sub></a><br /><a href="#content-dub" title="Content">🖋</a> <a href="#design-dub" title="Design">🎨</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://iame.li/"><img src="https://avatars2.githubusercontent.com/u/257909?v=4" width="100px;" alt="Eli Mallon"/><br /><sub><b>Eli Mallon</b></sub></a><br /><a href="https://github.com/fessonia/fessonia/commits?author=iameli" title="Documentation">📖</a></td>
    <td align="center"><a href="http://vinspee.me"><img src="https://avatars3.githubusercontent.com/u/582828?v=4" width="100px;" alt="Vince Speelman"/><br /><sub><b>Vince Speelman</b></sub></a><br /><a href="#review-VinSpee" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/DanielRussell"><img src="https://avatars3.githubusercontent.com/u/1772291?v=4" width="100px;" alt="DanielRussell"/><br /><sub><b>DanielRussell</b></sub></a><br /><a href="#review-DanielRussell" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/glensc"><img src="https://avatars1.githubusercontent.com/u/199095?v=4" width="100px;" alt="Elan Ruusamäe"/><br /><sub><b>Elan Ruusamäe</b></sub></a><br /><a href="https://github.com/fessonia/fessonia/issues?q=author%3Aglensc" title="Bug reports">🐛</a> <a href="#ideas-glensc" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/fessonia/fessonia/commits?author=glensc" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
</div>

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors)
specification. [Contributions of any kind are welcome!]{@tutorial 4_contributing}

## Talks about this Library <a name="talk-nihonjinrxs"></a>

* ["Modeling the Conceptual Structure of `ffmpeg` in JavaScript"](https://devfest2019.gdgneworleans.com/#ryan) - Ryan B. Harvey @ DevFest New Orleans, October 5, 2019. ([slides](http://bit.ly/fessonia-intro-slides))
* ["Modeling the Conceptual Structure of `ffmpeg` in JavaScript"](https://2019.demuxed.com/#schedule) - Ryan B. Harvey @ Demuxed, October 23, 2019. ([slides](https://bit.ly/fessonia-intro-slides))
* ["Evolving an API to Match a Conceptual Model: Expressing `ffmpeg` in JavaScript"](https://www.meetup.com/no-fun/events/268424936/) - Ryan B. Harvey @ New Orleans Functional Programming Meetup, February 5, 2020. ([slides](https://bit.ly/fessonia-evolving-api))

## About the Name Fessonia and the Butterfly Logo

The name Fessonia comes from the ancient Roman goddess Fessonia, apparently referenced by Augustine in his *City of God* (iv, 21), and [understood to be](https://pantheon.org/articles/f/fessonia.html)

> The goddess of weary persons, who is invoked to provide refreshment.

You can learn more about the goddess Fessonia, including some conjectures based on little evidence, at [her entry in the Obscure Goddess Online Dictionary](http://www.thaliatook.com/OGOD/fessonia.html).

What does that obscure goddess have to do with this library, you ask? Because the intent of this library was to provide refreshment for the author and his team from the weariness of dealing with FFmpeg command line invocations in their work automating video encoding pipelines using FFmpeg, that name seemed quite fitting.

The logo (drawn digitally by maintainer @nihonjinrxs) is a representation of [the butterfly *Adelpha f. fessonia*](https://www.butterfliesofamerica.com/adelpha_f_fessonia.htm), also known as the *Band-celled Sister*.
