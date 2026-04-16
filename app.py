import os
from pathlib import Path
import gradio as gr
from openai import OpenAI

APP_TITLE = "Chat with Beans"

PROMPT_FILE = Path(__file__).parent / "systemprompt.txt"
DEFAULT_PERSONALITY = PROMPT_FILE.read_text(encoding="utf-8")

KEY_FILE = Path(__file__).parent / "openaikey.txt"
APIKEY = KEY_FILE.read_text(encoding="utf-8").strip()

client = OpenAI(api_key=APIKEY)


def convert_history_to_input(history):
    items = []

    for turn in history or []:
        if not isinstance(turn, (list, tuple)) or len(turn) != 2:
            continue

        user_msg, assistant_msg = turn

        if user_msg:
            items.append({
                "role": "user",
                "content": [{"type": "input_text", "text": str(user_msg)}],
            })

        if assistant_msg:
            items.append({
                "role": "assistant",
                "content": [{"type": "output_text", "text": str(assistant_msg)}],
            })

    return items


def call_openai_responses_api(user_message, history, personality_prompt):
    if not APIKEY:
        return "OpenAI API key is missing."

    input_items = [
        {
            "role": "system",
            "content": [{"type": "input_text", "text": personality_prompt}],
        },
        *convert_history_to_input(history),
        {
            "role": "user",
            "content": [{"type": "input_text", "text": user_message}],
        },
    ]

    try:
        response = client.responses.create(
            model="gpt-5.4-mini",
            input=input_items,
        )

        text = getattr(response, "output_text", None)
        if text and text.strip():
            return text

        return "The model returned an empty response."

    except Exception as e:
        return f"Error calling OpenAI API: {e}"


def chat_fn(message, history):
    return call_openai_responses_api(
        user_message=message,
        history=history or [],
        personality_prompt=DEFAULT_PERSONALITY,
    )


with gr.Blocks(title=APP_TITLE, theme="soft") as demo:
    gr.Markdown("# Chat with Beans")
    gr.Markdown("Ask Beans about naps, walkies, cuddles, or his ideal home.")

    gr.ChatInterface(
        fn=chat_fn,
    )

if __name__ == "__main__":
    demo.launch()