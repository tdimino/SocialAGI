#!/bin/playground
// Import a few important pieces from the socialagi library
// check out https://www.socialagi.dev/Soul for further detail
import { Blueprints, Soul } from "socialagi";

// The SocialAGI Playground API allows code executed here to communicate
// with the Playground chat logs
import playground from "playground";

// Create our SocialAGI Soul from an example blueprint
let blueprint = Blueprints.SAMANTHA;
blueprint.personality += "\nSamantha likes Chocolate";
const soul = new Soul(blueprint);
const conversation = soul.getConversation("example");

// Listen for what the Soul wants to say
conversation.on("says", (text) => {
  // Route the Soul's message to the Playground chat logs
  playground.addMessage({ sender: "samantha", message: text });
});

// Listen for user messages in the Playground, and then route them
// to the SocialAGI Soul
playground.on("userMessage", (text) => {
  conversation.tell(text);
});

// Listen for thoughts from the soul and them log them as secondary
// outputs in the Playground chat
conversation.on("thinks", (text) => {
  playground.log(text);
});
