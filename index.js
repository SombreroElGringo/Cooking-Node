#!/usr/bin/env node

/**
 *
 *				 _____             _    _               _   _           _      
 *				/  __ \           | |  (_)             | \ | |         | |     
 *				| /  \/ ___   ___ | | ___ _ __   __ _  |  \| | ___   __| | ___ 
 *				| |    / _ \ / _ \| |/ / | '_ \ / _` | | . ` |/ _ \ / _` |/ _ \
 *				| \__/\ (_) | (_) |   <| | | | | (_| | | |\  | (_) | (_| |  __/
 *				 \____/\___/ \___/|_|\_\_|_| |_|\__, | \_| \_/\___/ \__,_|\___|
 *					                         __/ |                         
 *					                        |___/ 
 *
 *	@author: Florent Pailhes
 *	
 *	@git: https://github.com/SombreroElGringo/cooking-node.git
 *	
 *	@description: 	Cooking Node is an application develop with NodeJs. 
 *			This application is a cookbook in command prompt! 
 *		  	Like this the developpers will have no excuse for not cooking!
 *
 *	@version: 1.0.0
 *
 *	@license: MIT
 *
**/


//___________________________________________________________________________ Initialization ___

const program = require('commander')
const inquirer = require('inquirer')
const fs = require('fs')
const figlet = require('figlet')
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();

//Allows to create (if not exist) or open a connection with the database
var db = new sqlite3.Database(':dataCookingNode:');

//Create reusable transporter object using the default SMTP transport 
var transporter = nodemailer.createTransport('smtps://cookingnode%40gmail.com:cookmesomething@smtp.gmail.com')
//Allows to have the arguments of the command in the table args
var args = process.argv.slice(2);

//Allows to create the tables in the database (if not exist)
dbInitilization()


//___________________________________________________________________________ Commander ________

//Configuration parameters expected
program
	.version('1.0.0')
	.option('-A, --allTable', 'Show all tables and their sql request!')
	.option('-E, --exportRecipe [recipe_name]', 'Export the recipe in a recipe_name.txt')
	.option('-H, --hello [firstname] [familyname]', 'Show \'Hello top chef\' to someone!')
	.option('-I, --information', 'Show application description')
	.option('-L, --logo', 'Cooking Node ®')
	.option('-a, --addRecipe', 'Create a new recipe')
	.option('-c, --cookingBook', 'Show the cookbook')
	.option('-d, --delete', 'Delete a recipe or a country')
	.option('-e, --exportR', 'Export the recipe in a recipe_name.txt')
	.option('-i, --initialisation', 'Insert some data in the database')
	.option('-m, --mail', 'Send the recipe to someone')
	.option('-u, --update', 'Update a recipe or a country')
	

//We parse (convert in handable format) the options of the Synchrone function 
program.parse(process.argv)


//Condition with all actions of every commands
if(program.logo){
  
  //Allows to print the logo
  printLogo()  
} 
else if (program.information){

  console.log('\n\nCooking Node is an application develop with NodeJs.\n\rThis application is a cookbook in command prompt!\n\rLike this the developpers will have no excuse for not cooking!\n\nCooking Node®\n\n')
}
else if (program.initialisation){
  
  //Allows to insert some countries in the database
  initSomeCountries()
  //Allows to insert some recipes in the database
  initSomeRecipes()
}  
else if (program.hello){

  if ( args[1] != null && args[2] != null){
    
    console.log('Hello top Chef '+args[1]+' '+args[2]+' !')
  }
  else if ( args[1] == null && args[2] == null){
  	
  	console.log('Hello Anonymous top Chef !')
  } 
  else {
  	console.log('Hello top Chef '+args[1]+' !')
  }
}
else if (program.cookingBook){
  
  tableIsNotEmpty('countries').then((notEmpty) => {

    if (notEmpty == true){

  	  //Allows to show the dialog of the cookbook
  	  dialog()
    }
    else {

  	  console.log('The table countries is empty! Use this command \'cook -i\' for add some data to the app please!')
    }
  })
} 
else if (program.allTable){
  
  //Allows to show all tables of the database
  getTables()
} 
else if (program.addRecipe){

  //Allows to show the dialog to create something
  dialogCreateV()
}
else if (program.delete){
  
  tableIsNotEmpty('countries').then((notEmptyC) => {

  	tableIsNotEmpty('recipes').then((notEmptyR) => {

      if (notEmptyC == true && notEmptyR == true){

  	    //Allows to show the dialog to delete something
        dialogDelete()
      }
      else {

        console.log('The table countries or recipes is empty! Use this command \'cook -i\' for add some data to the app please!')	
      }
    })
  })
}  
else if (program.exportRecipe){

  tableIsNotEmpty('recipes').then((notEmptyR) => {

    if (notEmptyR == true){

      let recipeName = args[1]

      for (var i = 2, l = args.length; i < l ; i++) {

		recipeName += ' '+args[i]
  	  }

  	  if (recipeName != null){
      	//Allows to export a recipe in a file.txt
  	  	exportRecipe(recipeName)
  	  }
  	  else {

  	  	console.log('Please write the name of the recipe!')
  	  }
  	}
  	else {

  	  console.log('The table recipes is empty! Use this command \'cook -i\' for add some data to the app please!')	
  	}
  })
}
else if (program.exportR){
  
  tableIsNotEmpty('recipes').then((notEmptyR) => {

    if (notEmptyR == true){

      //Allows to show the dialog to export a recipe from the list of all recipes
      dialogExportR()
    }
    else {

      console.log('The table recipes is empty! Use this command \'cook -i\' for add some data to the app please!')	
    }
  })
}
else if (program.update){
  
  tableIsNotEmpty('countries').then((notEmptyC) => {

  	tableIsNotEmpty('recipes').then((notEmptyR) => {

      if (notEmptyC == true && notEmptyR == true){

  	    //Allows to show the dialog to update a recipe or a country
        dialogUpdate()
      }
      else {

        console.log('The table countries or recipes is empty! Use this command \'cook -i\' for add some data to the app please!')	
      }
    })
  })
}
else if (program.mail){

  dialogMail()
}   
else {
  
  //Allows to show the help
  program.help()
}


//***************************************** FUNCTIONS ****************************************\\


//___________________________________________________________________________ Inquirer _________

/** 
 * Allows to show the dialog of the cookbook
 *
 * @param {Object} countriesTab - List of all countries in the database
 * @param {string} answer.country - The name of the country selected
 */

function dialog(){

  getCountries().then((countriesTab) => {
	
	//Prompt allows to interact with the user
	inquirer.prompt([
		{
			type: 'list',
			message: 'You want to try a recipe from which country today?',
			name: 'country',
			choices: countriesTab
		}
	]).then((answer) => {

		dialogR(answer.country)
	})
  })
}


/** 
 * Allows to show the dialog of the recipes & print the recipe
 *
 * @param {Object} recipesTab - List of all recipes of the current country 
 * @param {string} answer.recipe - The name of the recipe selected
 * @param {Object} myRecipe - List of all information of the current recipe
 * @param {string} myRecipe[].name - The name of the recipe
 * @param {string} myRecipe[].type - The type of the recipe
 * @param {string} myRecipe[].time - The time of the recipe
 * @param {string} myRecipe[].ingredient - The ingredients of the recipe
 * @param {string} myRecipe[].method - The method of the recipe
 */

function dialogR(countryChoose){

  getRecipes(countryChoose).then((recipesTab) => {

  	  if (recipesTab.length != 0){

		inquirer.prompt([
			{
				type: 'list',
				message: 'Which recipe do you want try?',
				name: 'recipe',
				choices: recipesTab
			}
		]).then((answer) => {

	      getRecipeInfo(answer.recipe).then((myRecipe) => {

	      	console.log('\nName: '+myRecipe[0].name+'\n\nType: '+myRecipe[0].type+'\n\nTime: '+myRecipe[0].time+'\n\nIngredient: '+myRecipe[0].ingredient+'\n\nMethod: '+myRecipe[0].method+'\n\n')
	      })
		})
	  }
	  else {

	  	console.log('This country doesn\'t have recipe for the moment!\nBut you can create one if you want!!\n') 
	  }
  })
}


/** 
 * Allows to show the dialog to create something
 *
 * @param {string} answer.option - The option selected ('yes' or 'no')
 */

function dialogCreateV(){

  //Prompt allows to interact with the user
  inquirer.prompt([
		{
			type: 'list',
			message: 'You want add a new recipe at our cooking book?',
			name: 'option',
			choices: [
				'yes',
				'no'
			]
		}
  ]).then((answer) => {

	if (answer.option == 'yes'){

	  dialogCreateR()
	}else{

	  console.log('No problem! May be next time.')
	}
  })
}


/** 
 * Allows to show the dialog to create a recipe
 *
 * @param {string} answer.countryN - The name of the country
 * @param {string} answer.nameR - The name of the recipe
 * @param {string} answer.typeR - The type of the recipe
 * @param {string} answer.timeR - The time of the recipe
 * @param {string} answer.ingredientR - The ingredients of the recipe
 * @param {string} answer.methodR - The method of the recipe
 */

function dialogCreateR(){

  //Prompt allows to interact with the user
  inquirer.prompt([
		{
			type: 'input',
			message: 'Write the name of the recipe\'s country: ',
			name: 'countryN'
		},
		{
			type: 'input',
			message: 'Write the name of the recipe: ',
			name: 'nameR'
		},
		{
			type: 'input',
			message: 'Write the type of the recipe: ',
			name: 'typeR'
		},
		{
			type: 'input',
			message: 'How much time we need to cook the recipe: (example: 10 min to 1 hour) ',
			name: 'timeR'
		},
		{
			type: 'input',
			message: 'Write the ingredient\'s list: ',
			name: 'ingredientR'
		},
		{
			type: 'input',
			message: 'Write the method: ',
			name: 'methodR'
		}
  ]).then((answer) => {

  	insertCountry(answer.countryN)
  	insertRecipe(answer.nameR, answer.typeR, answer.timeR, answer.ingredientR, answer.methodR, answer.countryN)
  })
}


/** 
 * Allows to show the dialog to delete a country or a recipe
 *
 * @param {string} answer.option - The option selected ('country' or 'recipe')
 * @param {string} answer.countryN - The name of the country
 * @param {string} answers.option - The option selected ('yes' or 'no')
 * @param {string} answer.recipeN - The name of the recipe
 * @param {string} answers.option - The option selected ('yes' or 'no')
 */

function dialogDelete(){

  //Prompt allows to interact with the user
  inquirer.prompt([
		{
			type: 'list',
			message: 'What do you want delete?',
			name: 'option',
			choices: [
				'country',
				'recipe'
			]
		}
  ]).then((answer) => {

	if (answer.option == 'country'){

	  inquirer.prompt([
		{
			type: 'input',
			message: 'Write the name of the country you want delete: ',
			name: 'countryN'
		}
  	  ]).then((answer) => {

  	  	inquirer.prompt([
		{
			type: 'list',
			message: 'You want really delete '+answer.countryN+'? Every recipes of this country will be delete too!',
			name: 'option',
			choices: [
				'yes',
				'no'
			]
		}
        ]).then((answers) => {

		  if (answers.option == 'yes'){

		  	deleteCountry(answer.countryN)
	     	console.log(answer.countryN+' deleted!')
		  }else{

	        console.log(answer.countryN+' not deleted!')
	      }
        })
  	  })  
	}else{

	  inquirer.prompt([
		{
			type: 'input',
			message: 'Write the name of the recipe you want delete: ',
			name: 'recipeN'
		}
  	  ]).then((answer) => {

  	  	inquirer.prompt([
		{
			type: 'list',
			message: 'You want really delete '+answer.recipeN+'?',
			name: 'option',
			choices: [
				'yes',
				'no'
			]
		}
        ]).then((answers) => {

		  if (answers.option == 'yes'){

		  	deleteRecipe(answer.recipeN)
	     	console.log(answer.recipeN+' deleted!')
		  }else{

	        console.log(answer.recipeN+' not deleted!')
	      }
        })
  	  })  
	}
  })
}


/** 
 * Allows to show the dialog to update a country or a recipe
 *
 * @param {string} answer.option - The option selected ('country' or 'recipe')
 * @param {string} answer.countryN - The name of the country
 * @param {string} answers.option - The option selected ('yes' or 'no')
 * @param {string} answerC.newValue - The new name of the country
 * @param {string} answer.recipeN - The name of the recipe
 * @param {string} answers.option - The option selected ('yes' or 'no')
 * @param {string} answerP.recipeP - The param of the recipe to update
 * @param {string} answerV.newValue - The new value of the recipe
 */

function dialogUpdate(){

  //Prompt allows to interact with the user
  inquirer.prompt([
		{
			type: 'list',
			message: 'What do you want update?',
			name: 'option',
			choices: [
				'country',
				'recipe'
			]
		}
  ]).then((answer) => {

	if (answer.option == 'country'){

      getCountries().then((countriesTab) => {

	    inquirer.prompt([
		{
			type: 'list',
			message: 'Choose the name of the country you want update: ',
			name: 'countryN',
			choices: countriesTab
		}
  	    ]).then((answer) => {

  	  	  inquirer.prompt([
		  {
			type: 'list',
			message: 'You want really update '+answer.countryN+'?',
			name: 'option',
			choices: [
				'yes',
				'no'
			]
		  }
          ]).then((answers) => {

		  	if (answers.option == 'yes'){

		      inquirer.prompt([
		      {
				type: 'input',
				message: 'Write the new name of the country to update: ',
				name: 'newValue'
		      }
              ]).then((answerC) => {

		  	  	updateCountry(answer.countryN, answerC.newValue)
	     	  	console.log(answer.countryN+' updated in '+answerC.newValue+'!')
	          })
		  	}else{

	          console.log(answer.countryN+' not updated!')
	      	}
          })
  	    })
  	  })  
	}else{

	  getAllRecipes().then((recipesList) => {

	    inquirer.prompt([
		  {
			type: 'list',
			message: 'Choose the name of the recipe you want update: ',
			name: 'recipeN',
			choices: recipesList
		  }
  	    ]).then((answer) => {

  	  	  inquirer.prompt([
		  {
			type: 'list',
			message: 'You want really update '+answer.recipeN+'?',
			name: 'option',
			choices: [
				'yes',
				'no'
			]
		  }
          ]).then((answers) => {

		    if (answers.option == 'yes'){

		      inquirer.prompt([
			  {
				type: 'list',
				message: 'Choose the parameter of the recipe you want update: ',
				name: 'recipeP',
				choices: [
				    'name',
				    'type',
				    'time',
				    'ingredient',
				    'method'
			    ]
			  }
  	  		  ]).then((answerP) => {

  	  		    inquirer.prompt([
		        {
					type: 'input',
					message: 'Write the new value of the recipe to update: ',
					name: 'newValue'
		        }
                ]).then((answerC) => {

		  	      updateRecipe(answer.recipeN, answerP.recipeP, answerC.newValue)
	     	      console.log(answer.recipeN+' updated!')
	     	    })
	          })
		    }else{

	          console.log(answer.recipeN+' not updated!')
	        }
          })
  	    })  
	  })
	}
  })
}


/** 
 * Allows to show the dialog for export a recipe of the list
 *
 * @param {Object} recipesList - List of all recipes in the database
 * @param {string} answer.country - The name of recipe selected
 */

function dialogExportR(){
  
  getAllRecipes().then((recipesList) => {
	
  	//Prompt allows to interact with the user
	inquirer.prompt([
		{
			type: 'list',
			message: 'Choose the recipe you want export: ',
			name: 'recipeN',
			choices: recipesList
		}
	]).then((answer) => {

		exportRecipe(answer.recipeN)
	})
  }) 
}


/** 
 * Allows to show the mail's dialog
 *
 * @param {Object} recipesList - List of all recipes in the database
 * @param {string} answerC.email - Email of the reciver
 * @param {string} answer.recipeN - The name of the recipe
 */

function dialogMail(){

   getAllRecipes().then((recipesList) => {
	
  	//Prompt allows to interact with the user
	inquirer.prompt([
		{
			type: 'list',
			message: 'Choose the recipe you want send: ',
			name: 'recipeN',
			choices: recipesList
		}
	]).then((answer) => {

	  inquirer.prompt([
		      {
				type: 'input',
				message: 'Write the email: ',
				name: 'email'
		      }
      ]).then((answerC) => {

      	sendRecipeTo(answerC.email, answer.recipeN)
      })	
	})
  }) 
}


//___________________________________________________________________________ SQLite ___________

/** 
 * Allows to create tables in the database if not exist
 */

//Open the connection to the database & we create the table if they doesn't exist
function dbInitilization(){
  
  // Queries scheduled will be serialized.
  db.serialize(function() {
    
    // Queries scheduled will run in parallel.
    db.parallelize(function() {

      db.run('CREATE TABLE IF NOT EXISTS countries (id integer primary key autoincrement unique, name)')
      db.run('CREATE TABLE IF NOT EXISTS recipes (id integer primary key autoincrement unique, name, type, time, ingredient, method, id_Country)')
    })
  })    
}


/** 
 * Allows to get the list of all tables in the database
 *
 * @param {string} tables - All the tables in the database
 */

function getTables(){

  db.serialize(function () {

    db.all("SELECT name, sql FROM sqlite_master WHERE type='table'", function (err, tables) {

      console.log(tables)
    })
  })
}


/** 
 * Allows to check if a table are empty or not
 *
 * @param {string} tableName - The name the table to check
 * @param {integer} row['cnt'] - The number of row in the table
 * @return boolean notEmpty - If notEmpty equal true the table is not empty 
 */

function tableIsNotEmpty(tableName){
  
  var notEmpty = false

  return new Promise((resolve, reject)=>{

    db.serialize(function () {

      db.get("SELECT COUNT(id) AS cnt FROM "+tableName+" ", function (err, row) {

        if (row['cnt'] !=0){

      	  notEmpty = true
      	  resolve(notEmpty)
        }
        else {

      	  resolve(notEmpty)
        }
      })
    })
  })
}


/** 
 * Allows to get the list of all countries
 *
 * @return {Object} countriesList - All countries
 */

function getCountries(){

  return new Promise((resolve, reject)=>{	

	db.serialize(function () {

	  db.all("SELECT name FROM countries ORDER BY name", function (err, countriesList) {

	    resolve(countriesList)  
      })
	})
  })
}


/** 
 * Allows to get the list of recipes of the country selected
 *
 * @param {string} countryChoose - The name of the country
 * @param {integer} row['id'] - The id of the country
 * @return {Object} recipesList - All recipes of this country
 */

function getRecipes(countryChoose){

  return new Promise((resolve, reject)=>{	

	db.serialize(function () {

	  db.get("SELECT * FROM countries WHERE name='"+countryChoose+"' ", function (err, row) {

	  	//console.log(row['id']) // print the id of the country

	  	db.all("SELECT name FROM recipes WHERE id_Country="+row['id']+" ORDER BY name ", function (err, recipesList) {

	      resolve(recipesList) 
	    }) 
      })
	})
  })
}


/** 
 * Allows to get the list of all recipes in database
 *
 * @return {Object} recipesList - All recipes
 */

function getAllRecipes(){
  
  return new Promise((resolve, reject)=>{	

	db.serialize(function () {

	  db.all("SELECT name FROM recipes ORDER BY name", function (err, recipesList) {

	    resolve(recipesList)  
      })
	})
  })
}


/** 
 * Allows to get the informations of the recipe selected
 *
 * @param {string} recipeChoose - The name of the recipe
 * @return {Object} recipe - All the information of the recipe selected
 */

function getRecipeInfo(recipeChoose){

  return new Promise((resolve, reject)=>{	
    
    db.serialize(function () {

	  db.all("SELECT * FROM recipes WHERE name='"+recipeChoose+"' ", function (err, recipe) {
	  	
        resolve(recipe)
      })
    })
  })
}


/** 
 * Allows to insert a recipe in the database
 *
 * @param {string} nameR - The name of the recipe
 * @param {string} typeR - The type of the recipe
 * @param {string} timeR - The time of the recipe
 * @param {string} ingredientR - The ingredients of the recipe
 * @param {string} methodR - The method of the recipe
 * @param {string} countryR - The name of the country
 * @param {integer} rowR['cnt'] - The number of recipes where their name = nameR
 * @param {integer} row['id'] - The id of the country
 */

function insertRecipe(nameR, typeR, timeR, ingredientR, methodR, countryR){

  db.serialize(function () {

    db.get("SELECT COUNT(name) AS cnt FROM recipes WHERE name='"+nameR+"' ", function (err, rowR) {

      if (rowR['cnt'] == 0){

        db.get("SELECT id FROM countries WHERE name='"+countryR+"' ", function (err, row) {

	      return db.run('INSERT INTO recipes (name, type, time, ingredient, method, id_Country)VALUES ("'+nameR+'", "'+typeR+'", "'+timeR+'", "'+ingredientR+'", "'+methodR+'", '+row['id']+')')
	    })
	  } 
	  else {

	    console.log(nameR+' already exist!')
	  }
	})
  })
}


/** 
 * Allows to insert a country in the database
 *
 * @param {string} countryName - The name of the country
 * @param {integer} row['cnt'] - The number of countries where their name = countryName
 */

function insertCountry(countryName){
  
  db.serialize(function () {

    db.get("SELECT COUNT(name) AS cnt FROM countries WHERE name='"+countryName+"' ", function (err, row) {
    	
      if (row['cnt'] == 0){
      	
      	//console.log('Successful insertion of '+countryName+' !')
	    return db.run('INSERT INTO countries (name) VALUES ("'+countryName+'") ') 
	  } 
	  else {

	  	console.log(countryName+' already exist!')
	  }
	})
  })
}


/** 
 * Allows to delete a country and him recipes of the database
 *
 * @param {string} countryName - The name of the country
 * @param {integer} row['id'] - The id of the country
 */

function deleteCountry(countryName){

  db.get("SELECT id FROM countries WHERE name='"+countryName+"' ", function (err, row) {

  	db.run('DELETE FROM recipes WHERE id_Country='+row['id']+' ')
	db.run('DELETE FROM countries WHERE name="'+countryName+'" ')
  })
}


/** 
 * Allows to delete a recipe of the database
 *
 * @param {string} recipeName - The name of the recipe
 */

function deleteRecipe(recipeName){

  return db.run('DELETE FROM recipes WHERE name="'+recipeName+'" ')
}


/** 
 * Allows to delete a recipe of the database
 *
 * @param {string} recipeName - The name of the recipe
 * @param {string} paramToUpdate - The parameter to update
 * @param {string} newValue - The new value to update
 */

function updateRecipe(recipeName, paramToUpdate, newValue){

  return db.run('UPDATE recipes SET '+paramToUpdate+'="'+newValue+'" WHERE name="'+recipeName+'" ')
}


/** 
 * Allows to delete a recipe of the database
 *
 * @param {string} recipeName - The name of the recipe
 * @param {string} paramToUpdate - The parameter to update
 * @param {string} newValue - The new value to update
 */

function updateCountry(countryName, newValue){

  return db.run('UPDATE countries SET name="'+newValue+'" WHERE name="'+countryName+'" ')
}


/** 
 * Allows to close the connection to the database
 */

function dbClose(){

  db.close()
}

//___________________________________________________________________________ FileSystem _______

/** 
 * Allows to export the recipe selected
 *
 * @param {string} recipeName - The name of the recipe
 * @param {string} text - The recipe
 * @param {string} logo - The logo Cooking Node
 * @param {Object} myRecipe - The information of the recipe
 * @param {string} myRecipe[].name - The name of the recipe
 * @param {string} myRecipe[].type - The type of the recipe
 * @param {string} myRecipe[].time - The time of the recipe
 * @param {string} myRecipe[].ingredient - The ingredients of the recipe
 * @param {string} myRecipe[].method - The method of the recipe
 */

function exportRecipe(recipeName){

  try{

  	let text = ''
  	
  	getLogo().then((logo) => {

  	  text = logo

  	  getRecipeInfo(recipeName).then((myRecipe) => {

	    text += '\n\n\n\n\nName: '+myRecipe[0].name+'\n\nType: '+myRecipe[0].type+'\n\nTime: '+myRecipe[0].time+'\n\nIngredient: '+myRecipe[0].ingredient+'\n\nMethod: '+myRecipe[0].method   

	    //Ecrire un fichier
	    fs.writeFile(myRecipe[0].name+'.txt', text,(err) =>{
		  if (err) throw err
			  console.log('Recipe exported at '+__dirname)
	    })
	  })
    })
  }catch (err){

	console.error('ERR > ',err)
  }
}


//___________________________________________________________________________ Figlet ___________

/** 
 * Allows to print the logo
 *
 * @param {string} data - The logo in ASCII to print
 */

function printLogo() {

  //Generate a ASCII logo for the app
  figlet.text('Cooking Node',{
  	font: 'Doom',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  }, function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data)
  })
}


/** 
 * Allows to return the logo
 *
 * @return {string} data - The logo in ASCII to print
 */

function getLogo(){

  return new Promise((resolve, reject)=>{	

    //Generate a ASCII logo for the app
    figlet.text('Cooking Node',{

  	    font: 'Doom',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }, function(err, data) {
        if (err) {

        console.log('Something went wrong...');
        console.dir(err);
        return;
      }
      resolve(data)
    })
  })
}


//___________________________________________________________________________ NodeMail _________

/** 
 * Allows to send a mail with a recipe to someone
 *
 * @param {string} textMail - Message of the mail
 * @param {string} recipeName - Name of the recipe
 * @param {string} email - Email of the receiver
 * @param {Object} myRecipe - List of all information of the current recipe
 * @param {string} myRecipe[].name - The name of the recipe
 * @param {string} myRecipe[].type - The type of the recipe
 * @param {string} myRecipe[].time - The time of the recipe
 * @param {string} myRecipe[].ingredient - The ingredients of the recipe
 * @param {string} myRecipe[].method - The method of the recipe
 */

function sendRecipeTo(email, recipeName) {
  
  var textMail = ''

    getRecipeInfo(recipeName).then((myRecipe) => {
  	
	  textMail = '\n\n\n\n\nName: '+myRecipe[0].name+'\n\nType: '+myRecipe[0].type+'\n\nTime: '+myRecipe[0].time+'\n\nIngredient: '+myRecipe[0].ingredient+'\n\nMethod: '+myRecipe[0].method   

  	  // setup e-mail data with unicode symbols 
  	  var mailOptions = {
    	from: '"Cooking Node® 👥" <recipe@cooking-node.com>', // sender address 
    	to: ''+email+'', // list of receivers 
   	  	subject: 'Recipe: '+recipeName, // Subject line 
      	text: textMail // plaintext body 
      }
 
    // send mail with defined transport object 
    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    })
  })
}


//___________________________________________________________________________ Some data for the app

/** 
 * Allows to insert some recipes in the database
 *
 * @param {string} recipesList[recipe] - List of all recipes
 * @param {string} recipesList[].name - The name of the recipe
 * @param {string} recipesList[].type - The type of the recipe
 * @param {string} recipesList[].time - The time of the recipe
 * @param {string} recipesList[].ingredient - The ingredients of the recipe
 * @param {string} recipesList[].method - The method of the recipe
 * @param {string} recipesList[].country - The country of the recipe
 * @param {integer} i - Iterator
 * @param {integer} l - Length of the table recipesList
 */

function initSomeRecipes() {

  let recipesList = [
	{
	 	name: 'Profiteroles',
	 	type: 'déssert',
	 	time: '30min à 45min',
	 						
	 	ingredient: '\n\nPour la pâte à choux :\n\n - 25 cl d\'eau\n\r- 125 g de farine\n\r- 60 g de beurre\n\r- 1 pincée de sel\n\r- 50 g de sucre\n\r- 4 œufs Pour la sauce au chocolat :\n\n- 50 g de chocolat\n\r- 1 filet de lait Pour la garniture :\n\n- glace vanille\n\n',

		method: '\n\rPour la pâte à choux : \n\nMettre l\'eau, le beurre, le sucre et le sel dans une casserole sur le feu.\n\rPorter l\'eau à ébullition.\n\rRetirer du feu et verser la farine en une seule fois.\n\rMélanger avec une cuillère en bois et ne pas laisser de grumeaux.\n\rRemuer la pâte au dessus du feu, jusqu\'à ce qu\'elle se détache des parois de la casserole et forme une boule.\n\rLaisser refroidir une minute.\n\rIncorporer les œufs un à un.\n\rFormer les choux sur une plaque recouverte de papier sulfurisé..\n\rCuire au four chaud à 180°C (th.6) pendant une vingtaine de minutes.\n\rUne fois les choux refroidis, préparer votre sauce au chocolat.\n\rFaire fondre le chocolat au bain-marie avec un peu de lait (varier la quantité en fonction des goûts).\n\rPour finir, couper les choux en deux, les garnir d\'une boule de glace.\n\rDisposer les choux dans les assiettes et verser le chocolat tiède dessus.\n\rDéguster aussitôt.\n\rBon appétit !\n\n',

		country: 'France'
	},

	{
	 	name: 'Yakitori',
	 	type: 'plat',
	 	time: '10min à 30min',
	 						
	 	ingredient: '\n\n- 500 g de blancs de poulet découpés en lanières\n\r- huile pour graisser\n\rPour la marinade :\n\r- 6 cl de sauce teriyaki\n\r- 6 cl de miel\n\r- 1 gousse d\'ail pilée\n\r- 1 pincée de gingembre moulu\n\n',

		method: '\n\rUstensiles : petites brochettes de bambou\n\rMettre le poulet dans un saladier en verre, mélangez les ingrédients de la marinade et nappez-en le poulet.\n\rLaissez marinez plusieurs heures, voire toute une nuit au réfrigérateur.\n\rEnfilez deux lanières de blanc de poulet sur chaque brochette selon un mouvement ondulatoire.\n\rHuilez la grille du barbecue, attendez qu\'elle soit bien chaude et disposez les brochettes dessus.\n\rLaissez-les cuire pendant 2 mn de chaqus côté, en les badigeonnant de marinade pendant le temps de cuisson et en les retournant.\n\rA servir immédiatement et à déguster avec les doigts !\n\rBon appétit.\n\n',

		country: 'Japan'
	},

	{
	 	name: 'Gyoza',
	 	type: 'entrée',
	 	time: '45min à 1heure',

	 	ingredient: '\n\n- 4 cuillerées de sauce de soja\n\r- 4 cuillerées d\'huile de sesame\n\r- 4 cuillerées d\'eau\n\r- 10 feuilles de chou\n\r- une botte de \’nira\' (ciboulette chinoise)\n\r- 4 cuillerées de farine de pomme de terre\n\r- un peu d\'ail\n\r- 50 feuilles de ravioli chinois\n\r- 500 g de porc hache\n\n',

	 	method: '\n\r1) Mettre le porc dans un bol avec la sauce de soja, l\'huile de sésame et l\'eau et les mélanger.\n\r2) Cuire les feuilles de chou à l\'eau pour 2-3 mn et les hacher et les égoutter à la main. Hacher le nira et l\'ail.\n\rMettre les légumes dans un autre bol avec la farine de pomme de terre et les mélanger.\n\rMélanger 1 et 2.\n\r3) Mettre une cuillère de garniture sur chaque feuille de ravioli chinois et mettre un petit peu d\'eau au bord des feuilles et les envelopper.\n\rMettre de la farine de pomme de terre sur l\'assiette avant d\'y mettre les raviolis, sinon ils vont coller à l\'assiette.\n\r4) Mettre un peu d\'huile dans la poêle et y cuire les raviolis jusqu\'à ce qu\'ils deviennent marron clair. Mettre de l\'eau jusqu\'à la demi hauteur des raviolis et mettre le couvercle.\n\rLe lever quand l\'eau est presque disparue, et cuire les raviolis jusqu\'à ce que les feuilles des raviolis deviennent croustillantes.\n\n',

	 	country: 'Japan'
	},

	{
	 	name: 'Pizza',
	 	type: 'plat',
	 	time: '45min à 1heure',

	 	ingredient: '\n\n- un pâte à pizza prête à cuire\n\r- une petite boîte de concentrée de tomate\n\r- une barquette de 125 g de lardons nature\n\r- un petite boîte de champignon de Paris en lamelles\n\r- 2 grandes poignées de gruyère râpée\n\n',

	 	method: '\n\rFaire cuire dans une poêle les lardons et les champignons.\n\rDans un bol, verser la boîte de concentré de tomate, y ajouter un demi verre d\'eau, ensuite mettre un carré de sucre (pour enlever l\'acidité de la tomate) une pincée de sel, de poivre, et une pincée d\'herbe de Provence.\n\rDérouler la pâte à pizza sur le lèche frite de votre four, piquer-le.\n\rAvec une cuillère à soupe, étaler délicatement la sauce tomate, ensuite y ajouter les lardons et les champignons bien dorer.\n\rParsemer de fromage râpée.\n\rMettre au four à 220°, thermostat 7-8, pendant 20 min (ou lorsque le dessus de la pizza est doré).\n\n',

	 	country: 'Italia'
	}
  ]
  
  //console.log(recipesList[1].name)

  for (var i = 0, l = recipesList.length; i < l ; i++) {
  	
  	insertRecipe(recipesList[i].name, recipesList[i].type, recipesList[i].time, recipesList[i].ingredient, recipesList[i].method, recipesList[i].country)
  }
}


/** 
 * Allows to insert some countries in the database
 *
 * @param {string} countriesList[country] - List of all countries
 * @param {string} countriesList[].name - The name of the country
 * @param {integer} i - Iterator
 * @param {integer} l - Length of the table countriesList
 */

function initSomeCountries(){

  let countriesList = [
	{
		"name": "France"
	},
	{
		"name": "Japan"
	},
	{
		"name": "USA"
	},
	{
		"name": "Italia"
	}
  ]

  //console.log(countriesList[1].name)

  for (var i = 0, l = countriesList.length; i < l ; i++) {
  	
  	insertCountry(countriesList[i].name)
  }
}






