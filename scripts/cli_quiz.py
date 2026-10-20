#!/usr/bin/env python3
"""
AWS SAA-C03 Interactive Terminal Practice Quiz
Run questions directly in your terminal with colored answers and explanations.
Usage:
    python3 scripts/cli_quiz.py
    python3 scripts/cli_quiz.py --jump 142
    python3 scripts/cli_quiz.py --random
"""

import json
import os
import sys
import argparse
import random

from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "questions.json")
PROGRESS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "user_progress.json")

# ANSI Color Codes
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"

def clear_screen():
    print("\033[H\033[J", end="")

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_progress(data):
    try:
        data_dir = os.path.dirname(PROGRESS_FILE)
        os.makedirs(data_dir, exist_ok=True)
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        # Also write dated snapshot: aws-saa-progress-YYYY-MM-DD.json
        date_str = datetime.now().strftime("%Y-%m-%d")
        dated_file = os.path.join(data_dir, f"aws-saa-progress-{date_str}.json")
        with open(dated_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

def load_questions():
    if not os.path.exists(DATA_FILE):
        print(f"{RED}Error: Dataset not found at {DATA_FILE}. Run `python3 scripts/parse_dataset.py` first.{RESET}")
        sys.exit(1)
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def run_quiz(start_id=None, is_random=False):
    questions = load_questions()
    total = len(questions)
    progress = load_progress()

    last_id = progress.get("lastQuestionId") or progress.get("last_question_id")
    if start_id is None and not is_random and last_id:
        stats = progress.get("stats", {})
        ans_count = stats.get("totalAnswered", progress.get("answered_count", 0))
        cor_count = stats.get("totalCorrect", progress.get("correct_count", 0))
        saved_score = f"{cor_count}/{ans_count}"
        prompt_resume = input(f"{YELLOW}Found saved session at Question #{last_id} (Score: {saved_score}). Resume? [Y/n]: {RESET}").strip().lower()
        if prompt_resume in ["", "y", "yes"]:
            start_id = last_id
        else:
            start_id = 1
    elif start_id is None:
        start_id = 1
    
    if is_random:
        random.shuffle(questions)
        order = list(range(total))
    else:
        # 1-indexed to 0-indexed
        start_idx = max(0, min(start_id - 1, total - 1))
        order = list(range(start_idx, total))

    curr_idx = 0
    correct_count = progress.get("correct_count", 0) if (start_id > 1 and not is_random) else 0
    answered_count = progress.get("answered_count", 0) if (start_id > 1 and not is_random) else 0

    while curr_idx < len(order):
        q = questions[order[curr_idx]]
        clear_screen()

        # Header
        print(f"{BOLD}{CYAN}========================================================================{RESET}")
        print(f" {BOLD}AWS SAA-C03 Practice Quiz{RESET} | Question {BOLD}#{q['id']}{RESET} ({curr_idx + 1}/{total})")
        print(f" Domain: {YELLOW}{q['domain']}{RESET} | Score: {GREEN}{correct_count}/{answered_count}{RESET}")
        print(f"{BOLD}{CYAN}========================================================================{RESET}\n")

        # Question Prompt
        print(f"{BOLD}{q['prompt']}{RESET}\n")
        
        # Options
        for opt in q['options']:
            print(f"  {BOLD}{YELLOW}[{opt['key']}]{RESET} {opt['text']}")
        print()

        multi_hint = f"(Choose {q['expected_count']})" if q['is_multiselect'] else "(Choose 1)"
        print(f"{DIM}Commands: [1-5 / A-E to answer] | [N]ext | [P]rev | [J]ump # | [Q]uit {multi_hint}{RESET}")

        user_input = input(f"\n{BOLD}Your Choice >> {RESET}").strip()
        if not user_input:
            continue

        cmd = user_input.upper()
        if cmd == 'Q':
            print(f"\n{YELLOW}Exiting quiz. Final score: {correct_count}/{answered_count}{RESET}\n")
            break
        elif cmd == 'N':
            if curr_idx < len(order) - 1:
                curr_idx += 1
            continue
        elif cmd == 'P':
            if curr_idx > 0:
                curr_idx -= 1
            continue
        elif cmd.startswith('J'):
            parts = cmd.split()
            if len(parts) > 1 and parts[1].isdigit():
                target_id = int(parts[1])
                for idx, item in enumerate(questions):
                    if item['id'] == target_id:
                        order = list(range(idx, total))
                        curr_idx = 0
                        break
            continue

        # Map 1, 2, 3, 4, 5 -> A, B, C, D, E
        num_map = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E"}
        tokens = cmd.replace(",", " ").replace("+", " ").split()
        converted = [num_map.get(t, t) for t in tokens]
        chosen = [ch for ch in converted if ch in ["A", "B", "C", "D", "E"]]
        if not chosen:
            # Maybe joined string like "12" or "AB"
            chosen = [num_map.get(ch, ch) for ch in cmd if num_map.get(ch, ch) in ["A", "B", "C", "D", "E"]]

        if not chosen:
            print(f"{RED}Invalid input. Please choose options like 1, 2 or A, B{RESET}")
            input("Press Enter to continue...")
            continue

        chosen = sorted(list(set(chosen)))
        correct_answers = sorted(q['answer'])

        is_right = (chosen == correct_answers)
        answered_count += 1
        if is_right:
            correct_count += 1

        # Save progress
        user_answers = progress.get("userAnswers", progress.get("history", {}))
        submitted_map = progress.get("submitted", {})
        user_answers[str(q["id"])] = chosen
        submitted_map[str(q["id"])] = True

        progress.update({
            "lastQuestionId": q["id"] + 1 if q["id"] < total else q["id"],
            "lastUpdated": datetime.now().isoformat(),
            "userAnswers": user_answers,
            "submitted": submitted_map,
            "bookmarks": progress.get("bookmarks", []),
            "stats": {
                "totalAnswered": answered_count,
                "totalCorrect": correct_count
            }
        })
        save_progress(progress)

        print("\n" + "-" * 70)
        if is_right:
            print(f"{GREEN}{BOLD}✓ CORRECT!{RESET} Answer is: {', '.join(correct_answers)}")
        else:
            print(f"{RED}{BOLD}✗ INCORRECT.{RESET} Your answer: {', '.join(chosen)} | Correct: {GREEN}{BOLD}{', '.join(correct_answers)}{RESET}")

        print("\n" + f"{BOLD}{YELLOW}Explanation & Architecture Breakdown:{RESET}")
        print(f"{DIM}{q['explanation']}{RESET}")
        print("-" * 70)

        nav = input(f"\n{BOLD}[Enter for Next] | [P for Prev] | [Q to Quit] >> {RESET}").strip().upper()
        if nav == 'Q':
            break
        elif nav == 'P':
            if curr_idx > 0:
                curr_idx -= 1
        else:
            if curr_idx < len(order) - 1:
                curr_idx += 1
            else:
                print(f"\n{GREEN}{BOLD}You completed all questions! Score: {correct_count}/{answered_count}{RESET}\n")
                break

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AWS SAA-C03 Interactive Terminal Quiz")
    parser.add_argument("--jump", type=int, default=None, help="Start at question ID (1-684)")
    parser.add_argument("--random", action="store_true", help="Randomize question sequence")
    args = parser.parse_args()

    try:
        run_quiz(start_id=args.jump, is_random=args.random)
    except KeyboardInterrupt:
        print("\n\nGoodbye!\n")
