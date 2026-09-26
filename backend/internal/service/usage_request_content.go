package service

import (
	"strings"

	"github.com/tidwall/gjson"
)

// ExtractUsageRequestContent keeps only the latest user-authored text for the
// admin usage drilldown. Request options, tool definitions, and media payloads
// are intentionally excluded.
func ExtractUsageRequestContent(body []byte) string {
	if !gjson.ValidBytes(body) {
		return ""
	}
	input := gjson.GetBytes(body, "input")
	collector := moderationTextCollector{filterReminders: true}
	if input.IsArray() {
		items := input.Array()
		for i := len(items) - 1; i >= 0; i-- {
			if !collector.isResponsesUserTextItem(items[i]) {
				continue
			}
			var parts []string
			var images []string
			collector.collectContentValue(items[i].Get("content"), &parts, &images)
			if items[i].Get("type").String() == "input_text" || items[i].Get("text").Exists() {
				collector.collectContentValue(items[i], &parts, &images)
			}
			return normalizeContentModerationText(strings.Join(parts, "\n"))
		}
	}
	return ExtractContentModerationInput("", body).Text
}
