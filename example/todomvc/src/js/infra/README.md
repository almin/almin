# Repository

Perpetuation Domain object.

Often, create new instance of entity and return as **singleton**.

- インフラのリポジトリは汎用的な層だけど、依存関係が逆転してるのでTodo用に持ってる
- 保存してたデータは、取り出すときに毎回shallowな複製を行う
- getするたびにオブジェクトとしては同一 === ではないため、 idを使って同一なのかを比較する

![等価性](https://monosnap.com/file/twrUkBpDL5QnR0QQBeWPwsCOJ304pe.png)
