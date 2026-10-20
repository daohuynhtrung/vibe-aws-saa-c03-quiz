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

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "questions.json")

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

def load_questions():
    if not os.path.exists(DATA_FILE):
        print(f"{RED}Error: Dataset not found at {DATA_FILE}. Run `python3 scripts/parse_dataset.py` first.{RESET}")
        sys.exit(1)
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def run_quiz(start_id=1, is_random=False):
    questions = load_questions()
    total = len(questions)
    
    if is_random:
        random.shuffle(questions)
        order = list(range(total))
    else:
        # 1-indexed to 0-indexed
        start_idx = max(0, min(start_id - 1, total - 1))
        order = list(range(start_idx, total))

    curr_idx = 0
    correct_count = 0
    answered_count = 0

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
        print(f"{DIM}Commands: [A-E to answer] | [N]ext | [P]rev | [J]ump # | [Q]uit {multi_hint}{RESET}")

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

        # Clean chosen answers
        chosen = [ch for ch in cmd.replace(",", " ").replace("+", " ").split() if ch in ["A", "B", "C", "D", "E"]]
        if not chosen:
            # Maybe single string like "AB" or "AC"
            chosen = [ch for ch in cmd if ch in ["A", "B", "C", "D", "E"]]

        if not chosen:
            print(f"{RED}Invalid input. Please choose options like A or A, B{RESET}")
            input("Press Enter to continue...")
            continue

        chosen = sorted(list(set(chosen)))
        correct_answers = sorted(q['answer'])

        is_right = (chosen == correct_answers)
        answered_count += 1
        if is_right:
            correct_count += 1

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
    parser.add_argument("--jump", type=int, default=1, help="Start at question ID (1-684)")
    parser.add_argument("--random", action="store_true", help="Randomize question sequence")
    args = parser.parse_args()

    try:
        run_quiz(start_id=args.jump, is_random=args.random)
    except KeyboardInterrupt:
        print("\n\nGoodbye!\n")
