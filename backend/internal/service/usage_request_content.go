package service

// ExtractUsageRequestContent keeps only the latest user-authored text for the
// admin usage drilldown. Request options, tool definitions, and media payloads
// are intentionally excluded.
func ExtractUsageRequestContent(body []byte) string {
	return ExtractContentModerationInput("", body).Text
}
