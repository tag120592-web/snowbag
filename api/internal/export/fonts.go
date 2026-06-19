package export

import _ "embed"

// Кириллический шрифт DejaVu Sans (свободная лицензия Bitstream Vera / Arev —
// разрешает встраивание и распространение). Вшит в бинарь, чтобы PDF корректно
// отображал русский текст (стандартные шрифты gofpdf — только латиница).

//go:embed fonts/DejaVuSans.ttf
var dejaVuRegular []byte

//go:embed fonts/DejaVuSans-Bold.ttf
var dejaVuBold []byte
