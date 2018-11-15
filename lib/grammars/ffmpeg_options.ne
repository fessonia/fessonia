@{%
  const flatten = d => {
    return d.reduce((a, b) => {
      if (Array.isArray(b)) {
        return a.concat(flatten(b));
      }
      return a.concat(b);
    }, []);
  };
  
  const collapse = d => d.reduce(
    (a, b) => Array.isArray(b) ? a + b.join("") : a + b, ""
  );
  
  const filter_nulls = d => d.filter(
    (token) => token !== null
  );

  const remove_whitespace = token => token.replace(/[\s]+/g, '')

  const filter_whitespace = d => d.filter((token) => {
    const not_null = token !== null;
    if (typeof token === 'string') {
      const not_spaces = remove_whitespace(token) !== '';
      return not_null && not_spaces;
    }
    return not_null;
  });

  
  const filter_whitespace_and_flatten = d => {
    return filter_whitespace(flatten(d))
  };
  
  const filter_and_collapse = d => {
    return d
      .filter(token => token !== null)
	    .reduce(
        (a, b) => Array.isArray(b) ? a + b.join("") : a + b, ""
      );
  };

  const filter_and_collapse_removing_whitespace = d => {
    return d
      .filter(token => token !== null)
	    .reduce((a, b) => remove_whitespace(
        Array.isArray(b) ? a + b.join("") : a + b
      ), "");
  };
%}

# main outputs
# output ->
#   stderr stdout # combined with 2>&1
#   | stderr # just the version info
#   | stdout # just the actual help output

stderr -> # version info header written to stderr
  header newline

stdout -> # help output written to stdout
  options_header newline
  empty_line
  help_options_section newline
  empty_line
  print_help_section newline
  empty_line:*

# basic entities
newline -> "\n" {% collapse %}
whitespace -> [ \t]:+ {% filter_and_collapse %}
empty_line -> whitespace:? newline {% filter_and_collapse %}
digit -> [0-9] {% collapse %}
nonzero -> [1-9] {% collapse %}
number -> [0-9] | [1-9] [0-9]:+ {% filter_and_collapse %}
float ->
  [0-9] {% collapse %}
  | [1-9] [0-9]:+ {% filter_and_collapse %}
  | [0-9] "." [0-9]:+ {% filter_and_collapse %}
  | [1-9] [0-9]:+ "." [0-9]:+ {% filter_and_collapse %}
name -> [a-z] [a-z0-9_\-]:+ {% filter_and_collapse %}
ip_entry ->
  [0-9] {% collapse %}
  | [1-9] [0-9] {% filter_and_collapse %}
  | "1" [0-9] [0-9] {% filter_and_collapse %}
  | "2" [0-4] [0-9] {% filter_and_collapse %}
  | "25" [0-5] {% filter_and_collapse %}
file_path -> 
  ("./" | "/" | "~/") [A-Za-z0-9_\-\/\\\.]:+ {% filter_and_collapse %}
  | ("\"" | "'") ("./" | "/" | "~/")
    [A-Za-z0-9_\-\/\\\.\,\{\}\[\]\(\) ]:+ ("\"" | "'") {% filter_and_collapse %}
file -> file_path {% filter_and_collapse %} 
ip -> ip_entry "." ip_entry "." ip_entry "." ip_entry {% filter_and_collapse %}
uri_scheme -> "http" "s":? "://" {% filter_and_collapse %}
uri_host -> [a-z] [a-z0-9\-]:+ ("." [a-z] [a-z0-9\-]:+ ):+ {% filter_and_collapse %}
uri_port -> ":" [0-9]:+ {% filter_and_collapse %}
uri_path -> "\/" [A-Za-z0-9_\-\/\\\.]:+ {% filter_and_collapse %}
uri -> uri_scheme (uri_host | ip) uri_port:? uri_path {% filter_and_collapse %}

# option entities
option_name -> name | "?" {% filter_and_collapse %}
option_argument ->
  name {% filter_and_collapse %}
  | name "=" (name | number | file | uri):? {% filter_whitespace_and_flatten %}
option_definition -> "-" "-":? option_name ((whitespace | "=") option_argument):?
option_description -> [a-zA-Z0-9_\/\-\.\,\(\) ]:+ {% filter_and_collapse %}
option_line -> option_definition whitespace option_definition

###########################
# FFmpeg help header info #
###########################
header ->
  version_line empty_line
  build_line empty_line
  config empty_line
  libraries

# FFmpeg version line
version_line ->
  "ffmpeg version " version " Copyright (c) " copyright_year "-" copyright_year " the FFmpeg developers" {% filter_whitespace_and_flatten %}
version -> number "." number "." number {% filter_and_collapse %}
copyright_year -> "2" digit digit digit {% filter_and_collapse %}

# FFmpeg build line
build_line -> "  built with " build_tools {% filter_whitespace_and_flatten %}
build_tools -> [A-Za-z0-9\-\. \(\)]:+ {% filter_and_collapse %}

# FFmpeg config line
config -> "  configuration: " config_options {% filter_whitespace_and_flatten %}
config_options -> config_option
config_options -> config_option " " config_options
config_option ->
  "--" option_name {% filter_and_collapse %}
  | "--" option_argument {% filter_and_collapse %}

# FFmpeg loaded libraries
libraries -> library | library "\n" libraries {% filter_whitespace_and_flatten %}
library_version_component ->
  "  " digit {% filter_and_collapse %}
  | " " nonzero digit {% filter_and_collapse %}
  | nonzero digit digit {% filter_and_collapse %}
library_version -> library_version_component "." library_version_component "." library_version_component {% filter_and_collapse_removing_whitespace %}
library -> "  " name whitespace library_version " /" library_version

###################################
# FFmpeg options help header info #
###################################
options_header ->
  description empty_line
  usage {% filter_whitespace_and_flatten %}

description -> "Hyper fast Audio and Video encoder"
usage -> "usage: ffmpeg [options] [[infile options] -i infile]... {[outfile options] outfile}..."

######################################
# FFmpeg help "Getting help" section #
######################################
help_options_section -> "Getting help:" newline help_options
help_options -> 
  help_option {% filter_whitespace_and_flatten %}
  | help_option newline help_options {% filter_whitespace_and_flatten %}
  | note {% filter_whitespace_and_flatten %}
  | note newline help_options {% filter_whitespace_and_flatten %}
help_option -> whitespace:? option_definition " -- " option_description
note ->  whitespace "See man ffmpeg for detailed description of the options."

####################################
# FFmpeg help "Print help" section #
####################################
print_help_section -> "Print help / information / capabilities:" newline print_help_options
print_help_options -> 
  print_help_option {% filter_whitespace_and_flatten %}
  | print_help_option newline print_help_options {% filter_whitespace_and_flatten %}
print_help_option -> option_definition whitespace option_description {% filter_whitespace_and_flatten %}

########################################
# FFmpeg help "Global options" section #
########################################
global_options_section -> "Global options (affect whole program instead of just one file" ")":? ":" newline global_options
global_options ->
  global_option {% filter_whitespace_and_flatten %}
  | global_option newline global_options {% filter_whitespace_and_flatten %}
global_option -> option_line
