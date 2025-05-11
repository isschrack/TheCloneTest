class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.storyData.Visited = []; // Track visited scenes
        this.engine.storyData.PCUnlocked = false; // Track if PC is unlocked
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        // Track visited locations
        if (!this.engine.storyData.Visited.includes(key)) {
            this.engine.storyData.Visited.push(key);
        }

        if(locationData.Choices.length > 0) {
            let choices = locationData.Choices;
            for(let choice of choices) {
                // Check for conditions
                if (choice.Condition) {
                    let condition = choice.Condition;

                    // Variable equals check (e.g., for PCUnlocked)
                    if (condition.Variable && "Equals" in condition) {
                        let variable = condition.Variable;
                        let expected = condition.Equals;
                        if (this.engine.storyData[variable] !== expected) {
                            continue; // Skip this choice
                        }
                    }

                    // Visited location check
                    if (condition.Visited && !this.engine.storyData.Visited.includes(condition.Visited)) {
                        continue; // Skip if required scene not visited
                    }
                }

                // Add choices to the engine
                this.engine.addChoice(choice.Text, choice);
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(choice) {
        let target = choice.Target;

        // Set variables if needed
        if (choice.Set) {
            for (let variable in choice.Set) {
                this.engine.storyData[variable] = choice.Set[variable];
            }
        }

        // Logic for unlocking PC
        if (choice.Text == "Look at the PC") {
            if (this.engine.storyData.Password) {
                target = "unlocked";
                this.engine.storyData.PCUnlocked = true; // PC is unlocked
            } else {
                target = "locked";
            }
        }

        // Logic for entering the right hall only after PC is unlocked
        if (choice.Text == "Enter the Right Hall") {
            if (!this.engine.storyData.PCUnlocked) {
                this.engine.show("You cannot enter the Right Hall until you unlock the PC.");
                return; // Don't change the scene if PC is not unlocked
            } else {
                target = "Right Hall"; // Allow entering the Right Hall
            }
        }

        // Logic for leaving the office based on PCUnlock
/*         if (choice.Text == "Leave office") {
            if (this.engine.storyData.PCUnlocked) {
                target = "Light Hall"; // Allow leaving the office
            } else {
                this.engine.show("You can't leave the office until the PC is unlocked.");
                target = "Office" // Don't change the scene if PC is not unlocked
            }
        } */

        if (choice.Text == "Enter Code") {
            if (this.engine.storyData.Password1) {
                target = "Strong Door1";
            } else {
                target = "Strong Door2";
            }
        }

        if (choice.Target == "Whiteboards") {
            this.engine.storyData.Password = true;
        }

        if (choice.Target == "C-5") {
            this.engine.storyData.Password1 = true;
        }

        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            this.engine.gotoScene(Location, target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');
