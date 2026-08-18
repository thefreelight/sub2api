package service

import "testing"

func TestExtractUsageRequestContentResponses(t *testing.T) {
	body := []byte(`{"model":"gpt-5","tools":[{"type":"function","name":"search"}],"input":[{"role":"developer","content":"hidden instructions"},{"role":"user","content":[{"type":"input_text","text":"show me the latest release"}]},{"type":"function_call_output","output":"tool result"}]}`)
	if got := ExtractUsageRequestContent(body); got != "show me the latest release" {
		t.Fatalf("ExtractUsageRequestContent() = %q", got)
	}
}

func TestExtractUsageRequestContentChat(t *testing.T) {
	body := []byte(`{"model":"gpt-4","temperature":0.2,"messages":[{"role":"system","content":"hidden instructions"},{"role":"user","content":"hello"}]}`)
	if got := ExtractUsageRequestContent(body); got != "hello" {
		t.Fatalf("ExtractUsageRequestContent() = %q", got)
	}
}

func TestExtractUsageRequestContentRejectsOpaqueBody(t *testing.T) {
	if got := ExtractUsageRequestContent([]byte("H4sIAAAAAAAA")); got != "" {
		t.Fatalf("ExtractUsageRequestContent() = %q, want empty", got)
	}
}
