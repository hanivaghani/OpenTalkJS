// import ollama from "ollama";

// async function runChat() {
//   try {
//     const response = await ollama.chat({
//       model: "llama3.2:1b",
//       messages: [{ role: 'user', content: "Generate marketing emails" }]
//     });

//     console.log("Chatbot Response:", response.message.content);
//   } catch (error) {
//     console.error("Error occurred:", error.message);
//   }
// }

// runChat();

// import fs from 'fs';

// import ollama from "ollama";

// async function ai_main(q) {
//     const response = await ollama.chat({
//         model: "llama3.2:1b",
//         messages: [{ role: "user", content: q }],
//     });
//     let a = response.message.content;
//     fs.writeFile("a.txt",a,(err)=>{
//         if(err){
//             throw err;
//         }
//     });
// }

// ai_main(fs.readFileSync("q.txt", 'utf8',(err)=>{
//         if(err){
//             throw err;
//         }
//     }));


// const fs = require('fs');
// const { default: ollama } = require("ollama");
// const { join } = require('path');
// async function chatWithModel(content) {
//   try {
//     const response = await ollama.chat({
//       model: "llama3.2:1b",
//       messages: [{ role: "user", content }]
//     });
//     return response.message.content; 
//   } catch (error) {
//     throw new Error(`Ollama API error: ${error.message}`);
//   }
// }
// async function processAllFiles(inputFolderPath, outputFolderPath) {
//   try {
//      if (!fs.existsSync(outputFolderPath)) {
//       fs.mkdirSync(outputFolderPath, { recursive: true });
//     }
//     const files = fs.readdirSync(inputFolderPath);
//     for (const fileName of files) {
//       try {
//         const inputFilePath = join(inputFolderPath, fileName);
//         const inputContent = fs.readFileSync(inputFilePath, "utf-8");
//         const chatbotResponse = await chatWithModel(inputContent);
//         const outputFilePath = join(outputFolderPath, fileName);
//         fs.writeFileSync(outputFilePath, chatbotResponse, "utf-8");
//         console.log(`Processed: ${fileName}`);
//       } catch (fileError) {
//         console.error(`Error processing file ${fileName}:`, fileError.message);
//       }
//     }
//     console.log("All chatbot responses have been saved.");
//   } catch (error) {
//     console.error("Error occurred while processing files:", error.message);
//   }
// }
// const inputFolderPath = "Question";
// const outputFolderPath = "Output";
// processAllFiles(inputFolderPath, outputFolderPath);



const fs = require("fs");
const path = require("path");
const { default: ollama } = require("ollama");

function readQuestionsFromDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  const questions = [];

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    if (fs.lstatSync(filePath).isFile() && file.endsWith(".txt")) {
      const content = fs.readFileSync(filePath, "utf-8");
      questions.push({
        question: file.replace(".txt", ""),
        task: content,
      });
    }
  });

  return questions;
}

async function getChatbotResponse(taskContent) {
  try {
    const response = await ollama.chat({
      model: "llama3.2:1b",
      messages: [{ role: "user", content: taskContent }],
    });
    return response.message?.content || "No response";
  } catch (error) {
    console.error("Error getting chatbot response:", error.message);
    return "Error getting response";
  }
}

function createOutputFolder(categoryName, outputFolderPath) {
  const categoryFolderPath = path.join(outputFolderPath, categoryName);
  if (!fs.existsSync(categoryFolderPath)) {
    fs.mkdirSync(categoryFolderPath, { recursive: true });
    console.log(`Created folder for ${categoryName} at ${categoryFolderPath}`);
  }
  return categoryFolderPath;
}

async function saveResponseToFile(
  categoryName,
  responseIndex,
  responseContent,
  outputFolderPath
) {
  const categoryFolderPath = createOutputFolder(categoryName, outputFolderPath);
  const outputFilePath = path.join(
    categoryFolderPath,
    `o${responseIndex + 1}.txt`
  );
  try {
    fs.writeFileSync(outputFilePath, responseContent, "utf-8");
    console.log(`Saved response to ${outputFilePath}`);
  } catch (error) {
    console.error("Error saving response to file:", error.message);
  }
}

async function runChat() {
  try {
    const inputDirPath = "questions";
    const outputFolderPath = "outputs";
    const categoryType = process.argv[2];

    if (!categoryType) {
      console.error(
        "Please provide a category type as a command-line argument."
      );
      return;
    }

    if (!fs.existsSync(inputDirPath)) {
      console.error(`Input directory ${inputDirPath} does not exist.`);
      return;
    }

    const categoryDirs = fs.readdirSync(inputDirPath);

    const filteredCategories = categoryDirs.filter(
      (dir) =>
        fs.lstatSync(path.join(inputDirPath, dir)).isDirectory() &&
        dir.toLowerCase() === categoryType.toLowerCase()
    );

    if (filteredCategories.length === 0) {
      console.error(`No categories found with type: ${categoryType}`);
      return;
    }

    for (const categoryName of filteredCategories) {
      const categoryPath = path.join(inputDirPath, categoryName);
      const questions = readQuestionsFromDirectory(categoryPath);

      for (let i = 0; i < questions.length; i++) {
        const response = await getChatbotResponse(questions[i].task);
        await saveResponseToFile(categoryName, i, response, outputFolderPath);
      }
    }
  } catch (error) {
    console.error("Error occurred:", error.message);
  }
}

runChat();
