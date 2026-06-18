package analytics

import "encoding/json"

func ToJSON(v any) json.RawMessage {
	b, _ := json.Marshal(v)
	return b
}
