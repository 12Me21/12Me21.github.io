Syntax:

*action* *selector* [ [ **;** *operation* ] **;** *data* ]

Commands are separated using `~` (can be escaped as `~~`)

## Action

A single character that controls the action to perform:

`V` - Set value of element

`H` - Set innerHTML of element

`T` - Set textContent of element

`C` - Click on element

`Y` - Enable checkbox ("Yes")

`N` - Disable checkbox ("No")

`W` - Set innerText

## Selector

Css selector to choose the element to perform the action on

## Operation

List of operations to perform on the data. Multiple operations can be used, and will be performed in order.

`L` - Load from url

`S` - Convert from SB unicode (backslash -> yen, \x7F -> backslash)

## Data

A string

# Examples

`V#input;L;https://12Me21.github.io/test.txt`

-`L`oad the file `https://12Me21.github.io/test.txt`, set the `v`alue of document.querySelector(`#input`).
