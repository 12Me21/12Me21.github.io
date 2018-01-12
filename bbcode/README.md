bbcode tags:

`[b]text[/b]` - bold text
`[i]text[/i]` - italic text
`[u]text[/u]` - underlined text
`[s]text[/s]` - crossed out text
`[sup]text[/sup]` - superscript text
`[sub]text[/sub]` - subscript text
`[url=url]text[/url]` - link
`[code]text[/code]` - code block
`[icode]text[/icode]` - inline code
`[spoiler=name]text[/spoiler]` - spoiler (name optional)
`[img=url]title[/image]` - image
`[table]` - table start
`[col]` - next table cell
`[row]` - next table row
`[/table]` - table end
Finally, actually usable tables!

normal bbcode:
```
[table]
  [tr]
  [td]table 1[/td]
  [td]table 2[/td]
  [/tr]
  [tr]
  [td]table 3[/td]
  [td]table 4[/td]
  [/tr]
[/table]
```
improved bbcode:
```
[table]
table 1[col]table 2
[row]
table 3[col]table 4
[/table]
```
