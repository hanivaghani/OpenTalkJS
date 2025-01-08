import fs from 'fs';
import ollama from 'ollama';

let folder = 'questions';

async function runChat(question) {
  try {
    const response = await ollama.chat({
      model: "llama3.2:1b",
      messages: [{ role: 'user', content: question }]
    });

    return response.message.content;
  } catch (error) {
    console.error("Error occurred:", error.message);
  }
}


fs.readdir(folder, (err, files) => {
  if (err) {
    return console.error('Error reading directory:', err.message);
  }

  files.forEach((file) => {
    const filepath = `${folder}/${file}`;
    fs.readFile(filepath, 'utf8', async (err, question) => {
      if (err) {
        return console.error(`Error reading file ${file}:`, err.message);
      }
      let ans_file = file
      const response = await runChat(question);
      console.log(`Question from ${file}:`, question);
      console.log(`Response:`, response);
      fs.mkdirSync('answers', { recursive: true })
      let answer_path = `answers/${ans_file.replace('Q','A')}`
      console.log(`Answer path:`, answer_path)
      fs.appendFileSync(answer_path, response)
    });
  });
});