import json
import re
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_questions():
    # Read the JSON file
    logger.info("Reading questions.json file...")
    with open('src/data/questions.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    total_questions = len(data)
    processed_count = 0
    logger.info(f"Found {total_questions} questions to process")

    # Process each question
    for i, question in enumerate(data, 1):
        correct_answer_letter = None
        # First, find and remove the option with 'সঠিক উত্তর:'
        new_options = []
        for option in question.get('options', []):
            if 'সঠিক উত্তর:' in option.get('text', ''):
                # Extract the correct answer letter (ক, খ, গ, ঘ)
                match = re.search(r'\[(.*?)\]', option['text'])
                if match:
                    correct_answer_letter = match.group(1)
                processed_count += 1
                logger.info(f"Processing question {i}/{total_questions}: Found correct answer {correct_answer_letter}")
                continue  # Skip adding this option
            new_options.append(option)
        question['options'] = new_options

        # Now, set 'correct': true for the correct option
        if correct_answer_letter:
            for option in question['options']:
                # Option text usually starts with [ক], [খ], etc.
                match = re.match(r'\[(.*?)\]', option.get('text', ''))
                if match and match.group(1) == correct_answer_letter:
                    option['correct'] = True
                    logger.info(f"Set correct: true for option [{correct_answer_letter}] in question {i}")
                    break

    # Save the modified JSON
    logger.info(f"Saving changes... Processed {processed_count} questions")
    with open('src/data/questions.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info("Done!")

if __name__ == '__main__':
    process_questions() 