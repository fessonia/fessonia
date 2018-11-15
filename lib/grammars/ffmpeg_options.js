// Generated automatically by nearley, version 2.15.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "stderr", "symbols": ["header", "newline"]},
    {"name": "stdout$ebnf$1", "symbols": []},
    {"name": "stdout$ebnf$1", "symbols": ["stdout$ebnf$1", "empty_line"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "stdout", "symbols": ["options_header", "newline", "empty_line", "help_options_section", "newline", "empty_line", "print_help_section", "newline", "stdout$ebnf$1"]},
    {"name": "newline", "symbols": [{"literal":"\n"}], "postprocess": collapse},
    {"name": "whitespace$ebnf$1", "symbols": [/[ \t]/]},
    {"name": "whitespace$ebnf$1", "symbols": ["whitespace$ebnf$1", /[ \t]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "whitespace", "symbols": ["whitespace$ebnf$1"], "postprocess": filter_and_collapse},
    {"name": "empty_line$ebnf$1", "symbols": ["whitespace"], "postprocess": id},
    {"name": "empty_line$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "empty_line", "symbols": ["empty_line$ebnf$1", "newline"], "postprocess": filter_and_collapse},
    {"name": "digit", "symbols": [/[0-9]/], "postprocess": collapse},
    {"name": "nonzero", "symbols": [/[1-9]/], "postprocess": collapse},
    {"name": "number", "symbols": [/[0-9]/]},
    {"name": "number$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "number$ebnf$1", "symbols": ["number$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "number", "symbols": [/[1-9]/, "number$ebnf$1"], "postprocess": filter_and_collapse},
    {"name": "float", "symbols": [/[0-9]/], "postprocess": collapse},
    {"name": "float$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "float$ebnf$1", "symbols": ["float$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "float", "symbols": [/[1-9]/, "float$ebnf$1"], "postprocess": filter_and_collapse},
    {"name": "float$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "float$ebnf$2", "symbols": ["float$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "float", "symbols": [/[0-9]/, {"literal":"."}, "float$ebnf$2"], "postprocess": filter_and_collapse},
    {"name": "float$ebnf$3", "symbols": [/[0-9]/]},
    {"name": "float$ebnf$3", "symbols": ["float$ebnf$3", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "float$ebnf$4", "symbols": [/[0-9]/]},
    {"name": "float$ebnf$4", "symbols": ["float$ebnf$4", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "float", "symbols": [/[1-9]/, "float$ebnf$3", {"literal":"."}, "float$ebnf$4"], "postprocess": filter_and_collapse},
    {"name": "name$ebnf$1", "symbols": [/[a-z0-9_\-]/]},
    {"name": "name$ebnf$1", "symbols": ["name$ebnf$1", /[a-z0-9_\-]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "name", "symbols": [/[a-z]/, "name$ebnf$1"], "postprocess": filter_and_collapse},
    {"name": "ip_entry", "symbols": [/[0-9]/], "postprocess": collapse},
    {"name": "ip_entry", "symbols": [/[1-9]/, /[0-9]/], "postprocess": filter_and_collapse},
    {"name": "ip_entry", "symbols": [{"literal":"1"}, /[0-9]/, /[0-9]/], "postprocess": filter_and_collapse},
    {"name": "ip_entry", "symbols": [{"literal":"2"}, /[0-4]/, /[0-9]/], "postprocess": filter_and_collapse},
    {"name": "ip_entry$string$1", "symbols": [{"literal":"2"}, {"literal":"5"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ip_entry", "symbols": ["ip_entry$string$1", /[0-5]/], "postprocess": filter_and_collapse},
    {"name": "file_path$subexpression$1$string$1", "symbols": [{"literal":"."}, {"literal":"/"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "file_path$subexpression$1", "symbols": ["file_path$subexpression$1$string$1"]},
    {"name": "file_path$subexpression$1", "symbols": [{"literal":"/"}]},
    {"name": "file_path$subexpression$1$string$2", "symbols": [{"literal":"~"}, {"literal":"/"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "file_path$subexpression$1", "symbols": ["file_path$subexpression$1$string$2"]},
    {"name": "file_path$ebnf$1", "symbols": [/[A-Za-z0-9_\-\/\\\.]/]},
    {"name": "file_path$ebnf$1", "symbols": ["file_path$ebnf$1", /[A-Za-z0-9_\-\/\\\.]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "file_path", "symbols": ["file_path$subexpression$1", "file_path$ebnf$1"], "postprocess": filter_and_collapse},
    {"name": "file_path$subexpression$2", "symbols": [{"literal":"\""}]},
    {"name": "file_path$subexpression$2", "symbols": [{"literal":"'"}]},
    {"name": "file_path$subexpression$3$string$1", "symbols": [{"literal":"."}, {"literal":"/"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "file_path$subexpression$3", "symbols": ["file_path$subexpression$3$string$1"]},
    {"name": "file_path$subexpression$3", "symbols": [{"literal":"/"}]},
    {"name": "file_path$subexpression$3$string$2", "symbols": [{"literal":"~"}, {"literal":"/"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "file_path$subexpression$3", "symbols": ["file_path$subexpression$3$string$2"]},
    {"name": "file_path$ebnf$2", "symbols": [/[A-Za-z0-9_\-\/\\\.\,\{\}\[\]\(\) ]/]},
    {"name": "file_path$ebnf$2", "symbols": ["file_path$ebnf$2", /[A-Za-z0-9_\-\/\\\.\,\{\}\[\]\(\) ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "file_path$subexpression$4", "symbols": [{"literal":"\""}]},
    {"name": "file_path$subexpression$4", "symbols": [{"literal":"'"}]},
    {"name": "file_path", "symbols": ["file_path$subexpression$2", "file_path$subexpression$3", "file_path$ebnf$2", "file_path$subexpression$4"], "postprocess": filter_and_collapse},
    {"name": "file", "symbols": ["file_path"], "postprocess": filter_and_collapse},
    {"name": "ip", "symbols": ["ip_entry", {"literal":"."}, "ip_entry", {"literal":"."}, "ip_entry", {"literal":"."}, "ip_entry"], "postprocess": filter_and_collapse},
    {"name": "uri_scheme$string$1", "symbols": [{"literal":"h"}, {"literal":"t"}, {"literal":"t"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "uri_scheme$ebnf$1", "symbols": [{"literal":"s"}], "postprocess": id},
    {"name": "uri_scheme$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "uri_scheme$string$2", "symbols": [{"literal":":"}, {"literal":"/"}, {"literal":"/"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "uri_scheme", "symbols": ["uri_scheme$string$1", "uri_scheme$ebnf$1", "uri_scheme$string$2"], "postprocess": filter_and_collapse},
    {"name": "uri_host$ebnf$1", "symbols": [/[a-z0-9\-]/]},
    {"name": "uri_host$ebnf$1", "symbols": ["uri_host$ebnf$1", /[a-z0-9\-]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "uri_host$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[a-z0-9\-]/]},
    {"name": "uri_host$ebnf$2$subexpression$1$ebnf$1", "symbols": ["uri_host$ebnf$2$subexpression$1$ebnf$1", /[a-z0-9\-]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "uri_host$ebnf$2$subexpression$1", "symbols": [{"literal":"."}, /[a-z]/, "uri_host$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "uri_host$ebnf$2", "symbols": ["uri_host$ebnf$2$subexpression$1"]},
    {"name": "uri_host$ebnf$2$subexpression$2$ebnf$1", "symbols": [/[a-z0-9\-]/]},
    {"name": "uri_host$ebnf$2$subexpression$2$ebnf$1", "symbols": ["uri_host$ebnf$2$subexpression$2$ebnf$1", /[a-z0-9\-]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "uri_host$ebnf$2$subexpression$2", "symbols": [{"literal":"."}, /[a-z]/, "uri_host$ebnf$2$subexpression$2$ebnf$1"]},
    {"name": "uri_host$ebnf$2", "symbols": ["uri_host$ebnf$2", "uri_host$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "uri_host", "symbols": [/[a-z]/, "uri_host$ebnf$1", "uri_host$ebnf$2"], "postprocess": filter_and_collapse},
    {"name": "uri_port$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "uri_port$ebnf$1", "symbols": ["uri_port$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "uri_port", "symbols": [{"literal":":"}, "uri_port$ebnf$1"], "postprocess": filter_and_collapse},
    {"name": "uri_path$ebnf$1", "symbols": [/[A-Za-z0-9_\-\/\\\.]/]},
    {"name": "uri_path$ebnf$1", "symbols": ["uri_path$ebnf$1", /[A-Za-z0-9_\-\/\\\.]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "uri_path", "symbols": [{"literal":"/"}, "uri_path$ebnf$1"], "postprocess": filter_and_collapse},
    {"name": "uri$subexpression$1", "symbols": ["uri_host"]},
    {"name": "uri$subexpression$1", "symbols": ["ip"]},
    {"name": "uri$ebnf$1", "symbols": ["uri_port"], "postprocess": id},
    {"name": "uri$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "uri", "symbols": ["uri_scheme", "uri$subexpression$1", "uri$ebnf$1", "uri_path"], "postprocess": filter_and_collapse},
    {"name": "option_name", "symbols": ["name"]},
    {"name": "option_name", "symbols": [{"literal":"?"}], "postprocess": filter_and_collapse},
    {"name": "option_argument", "symbols": ["name"], "postprocess": filter_and_collapse},
    {"name": "option_argument$ebnf$1$subexpression$1", "symbols": ["name"]},
    {"name": "option_argument$ebnf$1$subexpression$1", "symbols": ["number"]},
    {"name": "option_argument$ebnf$1$subexpression$1", "symbols": ["file"]},
    {"name": "option_argument$ebnf$1$subexpression$1", "symbols": ["uri"]},
    {"name": "option_argument$ebnf$1", "symbols": ["option_argument$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "option_argument$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "option_argument", "symbols": ["name", {"literal":"="}, "option_argument$ebnf$1"], "postprocess": filter_whitespace_and_flatten},
    {"name": "option_definition$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "option_definition$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "option_definition$ebnf$2$subexpression$1$subexpression$1", "symbols": ["whitespace"]},
    {"name": "option_definition$ebnf$2$subexpression$1$subexpression$1", "symbols": [{"literal":"="}]},
    {"name": "option_definition$ebnf$2$subexpression$1", "symbols": ["option_definition$ebnf$2$subexpression$1$subexpression$1", "option_argument"]},
    {"name": "option_definition$ebnf$2", "symbols": ["option_definition$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "option_definition$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "option_definition", "symbols": [{"literal":"-"}, "option_definition$ebnf$1", "option_name", "option_definition$ebnf$2"]},
    {"name": "option_description$ebnf$1", "symbols": [/[a-zA-Z0-9_\/\-\.\,\(\) ]/]},
    {"name": "option_description$ebnf$1", "symbols": ["option_description$ebnf$1", /[a-zA-Z0-9_\/\-\.\,\(\) ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "option_description", "symbols": ["option_description$ebnf$1"], "postprocess": filter_and_collapse},
    {"name": "option_line", "symbols": ["option_definition", "whitespace", "option_definition"]},
    {"name": "header", "symbols": ["version_line", "empty_line", "build_line", "empty_line", "config", "empty_line", "libraries"]},
    {"name": "version_line$string$1", "symbols": [{"literal":"f"}, {"literal":"f"}, {"literal":"m"}, {"literal":"p"}, {"literal":"e"}, {"literal":"g"}, {"literal":" "}, {"literal":"v"}, {"literal":"e"}, {"literal":"r"}, {"literal":"s"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "version_line$string$2", "symbols": [{"literal":" "}, {"literal":"C"}, {"literal":"o"}, {"literal":"p"}, {"literal":"y"}, {"literal":"r"}, {"literal":"i"}, {"literal":"g"}, {"literal":"h"}, {"literal":"t"}, {"literal":" "}, {"literal":"("}, {"literal":"c"}, {"literal":")"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "version_line$string$3", "symbols": [{"literal":" "}, {"literal":"t"}, {"literal":"h"}, {"literal":"e"}, {"literal":" "}, {"literal":"F"}, {"literal":"F"}, {"literal":"m"}, {"literal":"p"}, {"literal":"e"}, {"literal":"g"}, {"literal":" "}, {"literal":"d"}, {"literal":"e"}, {"literal":"v"}, {"literal":"e"}, {"literal":"l"}, {"literal":"o"}, {"literal":"p"}, {"literal":"e"}, {"literal":"r"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "version_line", "symbols": ["version_line$string$1", "version", "version_line$string$2", "copyright_year", {"literal":"-"}, "copyright_year", "version_line$string$3"], "postprocess": filter_whitespace_and_flatten},
    {"name": "version", "symbols": ["number", {"literal":"."}, "number", {"literal":"."}, "number"], "postprocess": filter_and_collapse},
    {"name": "copyright_year", "symbols": [{"literal":"2"}, "digit", "digit", "digit"], "postprocess": filter_and_collapse},
    {"name": "build_line$string$1", "symbols": [{"literal":" "}, {"literal":" "}, {"literal":"b"}, {"literal":"u"}, {"literal":"i"}, {"literal":"l"}, {"literal":"t"}, {"literal":" "}, {"literal":"w"}, {"literal":"i"}, {"literal":"t"}, {"literal":"h"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "build_line", "symbols": ["build_line$string$1", "build_tools"], "postprocess": filter_whitespace_and_flatten},
    {"name": "build_tools$ebnf$1", "symbols": [/[A-Za-z0-9\-\. \(\)]/]},
    {"name": "build_tools$ebnf$1", "symbols": ["build_tools$ebnf$1", /[A-Za-z0-9\-\. \(\)]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "build_tools", "symbols": ["build_tools$ebnf$1"], "postprocess": filter_and_collapse},
    {"name": "config$string$1", "symbols": [{"literal":" "}, {"literal":" "}, {"literal":"c"}, {"literal":"o"}, {"literal":"n"}, {"literal":"f"}, {"literal":"i"}, {"literal":"g"}, {"literal":"u"}, {"literal":"r"}, {"literal":"a"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}, {"literal":":"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "config", "symbols": ["config$string$1", "config_options"], "postprocess": filter_whitespace_and_flatten},
    {"name": "config_options", "symbols": ["config_option"]},
    {"name": "config_options", "symbols": ["config_option", {"literal":" "}, "config_options"]},
    {"name": "config_option$string$1", "symbols": [{"literal":"-"}, {"literal":"-"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "config_option", "symbols": ["config_option$string$1", "option_name"], "postprocess": filter_and_collapse},
    {"name": "config_option$string$2", "symbols": [{"literal":"-"}, {"literal":"-"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "config_option", "symbols": ["config_option$string$2", "option_argument"], "postprocess": filter_and_collapse},
    {"name": "libraries", "symbols": ["library"]},
    {"name": "libraries", "symbols": ["library", {"literal":"\n"}, "libraries"], "postprocess": filter_whitespace_and_flatten},
    {"name": "library_version_component$string$1", "symbols": [{"literal":" "}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "library_version_component", "symbols": ["library_version_component$string$1", "digit"], "postprocess": filter_and_collapse},
    {"name": "library_version_component", "symbols": [{"literal":" "}, "nonzero", "digit"], "postprocess": filter_and_collapse},
    {"name": "library_version_component", "symbols": ["nonzero", "digit", "digit"], "postprocess": filter_and_collapse},
    {"name": "library_version", "symbols": ["library_version_component", {"literal":"."}, "library_version_component", {"literal":"."}, "library_version_component"], "postprocess": filter_and_collapse_removing_whitespace},
    {"name": "library$string$1", "symbols": [{"literal":" "}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "library$string$2", "symbols": [{"literal":" "}, {"literal":"/"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "library", "symbols": ["library$string$1", "name", "whitespace", "library_version", "library$string$2", "library_version"]},
    {"name": "options_header", "symbols": ["description", "empty_line", "usage"], "postprocess": filter_whitespace_and_flatten},
    {"name": "description$string$1", "symbols": [{"literal":"H"}, {"literal":"y"}, {"literal":"p"}, {"literal":"e"}, {"literal":"r"}, {"literal":" "}, {"literal":"f"}, {"literal":"a"}, {"literal":"s"}, {"literal":"t"}, {"literal":" "}, {"literal":"A"}, {"literal":"u"}, {"literal":"d"}, {"literal":"i"}, {"literal":"o"}, {"literal":" "}, {"literal":"a"}, {"literal":"n"}, {"literal":"d"}, {"literal":" "}, {"literal":"V"}, {"literal":"i"}, {"literal":"d"}, {"literal":"e"}, {"literal":"o"}, {"literal":" "}, {"literal":"e"}, {"literal":"n"}, {"literal":"c"}, {"literal":"o"}, {"literal":"d"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "description", "symbols": ["description$string$1"]},
    {"name": "usage$string$1", "symbols": [{"literal":"u"}, {"literal":"s"}, {"literal":"a"}, {"literal":"g"}, {"literal":"e"}, {"literal":":"}, {"literal":" "}, {"literal":"f"}, {"literal":"f"}, {"literal":"m"}, {"literal":"p"}, {"literal":"e"}, {"literal":"g"}, {"literal":" "}, {"literal":"["}, {"literal":"o"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}, {"literal":"s"}, {"literal":"]"}, {"literal":" "}, {"literal":"["}, {"literal":"["}, {"literal":"i"}, {"literal":"n"}, {"literal":"f"}, {"literal":"i"}, {"literal":"l"}, {"literal":"e"}, {"literal":" "}, {"literal":"o"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}, {"literal":"s"}, {"literal":"]"}, {"literal":" "}, {"literal":"-"}, {"literal":"i"}, {"literal":" "}, {"literal":"i"}, {"literal":"n"}, {"literal":"f"}, {"literal":"i"}, {"literal":"l"}, {"literal":"e"}, {"literal":"]"}, {"literal":"."}, {"literal":"."}, {"literal":"."}, {"literal":" "}, {"literal":"{"}, {"literal":"["}, {"literal":"o"}, {"literal":"u"}, {"literal":"t"}, {"literal":"f"}, {"literal":"i"}, {"literal":"l"}, {"literal":"e"}, {"literal":" "}, {"literal":"o"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}, {"literal":"s"}, {"literal":"]"}, {"literal":" "}, {"literal":"o"}, {"literal":"u"}, {"literal":"t"}, {"literal":"f"}, {"literal":"i"}, {"literal":"l"}, {"literal":"e"}, {"literal":"}"}, {"literal":"."}, {"literal":"."}, {"literal":"."}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "usage", "symbols": ["usage$string$1"]},
    {"name": "help_options_section$string$1", "symbols": [{"literal":"G"}, {"literal":"e"}, {"literal":"t"}, {"literal":"t"}, {"literal":"i"}, {"literal":"n"}, {"literal":"g"}, {"literal":" "}, {"literal":"h"}, {"literal":"e"}, {"literal":"l"}, {"literal":"p"}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "help_options_section", "symbols": ["help_options_section$string$1", "newline", "help_options"]},
    {"name": "help_options", "symbols": ["help_option"], "postprocess": filter_whitespace_and_flatten},
    {"name": "help_options", "symbols": ["help_option", "newline", "help_options"], "postprocess": filter_whitespace_and_flatten},
    {"name": "help_options", "symbols": ["note"], "postprocess": filter_whitespace_and_flatten},
    {"name": "help_options", "symbols": ["note", "newline", "help_options"], "postprocess": filter_whitespace_and_flatten},
    {"name": "help_option$ebnf$1", "symbols": ["whitespace"], "postprocess": id},
    {"name": "help_option$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "help_option$string$1", "symbols": [{"literal":" "}, {"literal":"-"}, {"literal":"-"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "help_option", "symbols": ["help_option$ebnf$1", "option_definition", "help_option$string$1", "option_description"]},
    {"name": "note$string$1", "symbols": [{"literal":"S"}, {"literal":"e"}, {"literal":"e"}, {"literal":" "}, {"literal":"m"}, {"literal":"a"}, {"literal":"n"}, {"literal":" "}, {"literal":"f"}, {"literal":"f"}, {"literal":"m"}, {"literal":"p"}, {"literal":"e"}, {"literal":"g"}, {"literal":" "}, {"literal":"f"}, {"literal":"o"}, {"literal":"r"}, {"literal":" "}, {"literal":"d"}, {"literal":"e"}, {"literal":"t"}, {"literal":"a"}, {"literal":"i"}, {"literal":"l"}, {"literal":"e"}, {"literal":"d"}, {"literal":" "}, {"literal":"d"}, {"literal":"e"}, {"literal":"s"}, {"literal":"c"}, {"literal":"r"}, {"literal":"i"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}, {"literal":" "}, {"literal":"o"}, {"literal":"f"}, {"literal":" "}, {"literal":"t"}, {"literal":"h"}, {"literal":"e"}, {"literal":" "}, {"literal":"o"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}, {"literal":"s"}, {"literal":"."}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "note", "symbols": ["whitespace", "note$string$1"]},
    {"name": "print_help_section$string$1", "symbols": [{"literal":"P"}, {"literal":"r"}, {"literal":"i"}, {"literal":"n"}, {"literal":"t"}, {"literal":" "}, {"literal":"h"}, {"literal":"e"}, {"literal":"l"}, {"literal":"p"}, {"literal":" "}, {"literal":"/"}, {"literal":" "}, {"literal":"i"}, {"literal":"n"}, {"literal":"f"}, {"literal":"o"}, {"literal":"r"}, {"literal":"m"}, {"literal":"a"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}, {"literal":" "}, {"literal":"/"}, {"literal":" "}, {"literal":"c"}, {"literal":"a"}, {"literal":"p"}, {"literal":"a"}, {"literal":"b"}, {"literal":"i"}, {"literal":"l"}, {"literal":"i"}, {"literal":"t"}, {"literal":"i"}, {"literal":"e"}, {"literal":"s"}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "print_help_section", "symbols": ["print_help_section$string$1", "newline", "print_help_options"]},
    {"name": "print_help_options", "symbols": ["print_help_option"], "postprocess": filter_whitespace_and_flatten},
    {"name": "print_help_options", "symbols": ["print_help_option", "newline", "print_help_options"], "postprocess": filter_whitespace_and_flatten},
    {"name": "print_help_option", "symbols": ["option_definition", "whitespace", "option_description"], "postprocess": filter_whitespace_and_flatten},
    {"name": "global_options_section$string$1", "symbols": [{"literal":"G"}, {"literal":"l"}, {"literal":"o"}, {"literal":"b"}, {"literal":"a"}, {"literal":"l"}, {"literal":" "}, {"literal":"o"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}, {"literal":"s"}, {"literal":" "}, {"literal":"("}, {"literal":"a"}, {"literal":"f"}, {"literal":"f"}, {"literal":"e"}, {"literal":"c"}, {"literal":"t"}, {"literal":" "}, {"literal":"w"}, {"literal":"h"}, {"literal":"o"}, {"literal":"l"}, {"literal":"e"}, {"literal":" "}, {"literal":"p"}, {"literal":"r"}, {"literal":"o"}, {"literal":"g"}, {"literal":"r"}, {"literal":"a"}, {"literal":"m"}, {"literal":" "}, {"literal":"i"}, {"literal":"n"}, {"literal":"s"}, {"literal":"t"}, {"literal":"e"}, {"literal":"a"}, {"literal":"d"}, {"literal":" "}, {"literal":"o"}, {"literal":"f"}, {"literal":" "}, {"literal":"j"}, {"literal":"u"}, {"literal":"s"}, {"literal":"t"}, {"literal":" "}, {"literal":"o"}, {"literal":"n"}, {"literal":"e"}, {"literal":" "}, {"literal":"f"}, {"literal":"i"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "global_options_section$ebnf$1", "symbols": [{"literal":")"}], "postprocess": id},
    {"name": "global_options_section$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "global_options_section", "symbols": ["global_options_section$string$1", "global_options_section$ebnf$1", {"literal":":"}, "newline", "global_options"]},
    {"name": "global_options", "symbols": ["global_option"], "postprocess": filter_whitespace_and_flatten},
    {"name": "global_options", "symbols": ["global_option", "newline", "global_options"], "postprocess": filter_whitespace_and_flatten},
    {"name": "global_option", "symbols": ["option_line"]}
]
  , ParserStart: "stderr"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
