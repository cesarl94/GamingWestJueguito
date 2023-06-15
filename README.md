![Run Install](docs/images/bunnybox.png)
### Killabunnies' framework for make HTML5 videogames. The project is a boilerplate for make games using PixiJS.

The language used is TypeScript, and we recommend use Visual Studio Code for edit the code. Is necessary have installed NodeJS and NPM for install the dependencies.

## How to install

You will clone this project and use it as template. You can fork this project and use it as template for your own games easily, but we recommend clone the project. Here you have the instructions for clone the project:

1. Create a new repository from GitHub, for example ``my-game-name``.
2. Go to the windows console and go to the folder where you have your projects, for example ``cd Documents\Projects``
3. Clone the project with the command ``git clone git@github.com:Killabunnies/bunnybox.git my-game-name``
4. Now go to the folder of the project with the command ``cd my-game-name``
5. Remove the origin with the command ``git remote remove origin``
6. Copy the SSH URL of the new repository, from GitHub
7. Returning to cmd, add the origin of your new repository with the command ``git remote add origin <SSH URL of my-game-name>``
8. Now push the project to the new repository with the command ``git push --set-upstream origin master``

Now we have the project cloned and ready to use, in the folder ``my-game-name``. We can open the project with Visual Studio Code, but first we must install the dependencies.

You can install or update all dependencies with the command `npm install`. Also you can click with the right button of the mouse in the file `package.json` from the `NPM SCRIPTS` tab from the EXPLORER panel of VS Code and select `Run Install`. After that, you can run the project with `Run Start`.

![Run Install](docs/images/NPMScripts.png)

After update the dependencies, you are only one step away from running the project. First, you must open the server for run the game. You can open the server with the command `npm start`. Also you can go again to the `NPM SCRIPTS` tab from the EXPLORER panel of VS Code and click `Run` button from the `start` script.

![Run start](docs/images/NPMScripts2.png)

Now we can run and debug the proyect pressing `F5` or going to the RUN AND DEBUG panel of VS Code and clicking `Start Debugging` button. We can choose the browser that we want to use for run the game, and choose if we want to run the game with clamped FPS or not.

The project will be compiled and the browser will be opened with the game running. If you edit the code, the project will be compiled again and the browser will be reloaded with the changes.

You can see another options in the panel `NPM SCRIPTS` from the EXPLORER panel of VS Code. For example, you can build the project with `build:release` or `build:debug` scripts, the project will be compiled in the `dist` folder.


## How to use the framework

First we will explore the structure of the project. The main folder of the framework contains the following subfolders:
* assets: here you will put almost all your assets in the corresponding folder depending on the type of asset (images, fonts, music, sfx, etc.) 
* atlas: Here you will find more subfolders, **its important that you dont put any image here** except folders. You can create the folders that you want, and inside of them you will put the images that you want to pack in a texture atlas. All the images used in a scene should living in the same folder. The images must be smaller than 2048 x 2048. If you need a image bigger than 2048 x 2048, you can put it in the folder `assets/images` and it will be loaded as a normal image.
* src: here you will put your code


The framework is based on the use of scenes. Each scene is a class that extends from the class `PixiScene`. We can see an example of a scene in the files `src/project/scenes/DuckScene.ts` or `src/project/scenes/MenuScene.ts`. The scenes are managed by the class `SceneManager`. The SceneManager is the responsible of open and switch between scenes and popups. Also we can use transitions between Scenes.

The point of entry of the project is the file `src/index.ts`. Here you can see the initialization of the game, the creation of the SceneManager and the first scene that will be opened, the DuckScene 🦆, with a demo of PixiJS and Pixi3D



TODO :)\
fonts\
assets\
scene manager\
src\
atlas\
flags\
tweens\
Documentacion\
ejemplos\
tutoriales