#!/bin/playground
// Import a few important pieces from the socialagi library
// check out https://www.socialagi.dev/Soul for further detail
import { Action, CortexStep, CortexScheduler } from "socialagi";
import playground from "playground";

// subroutine for modeling Samantha's replies
const samanthaReplies = async (signal, newMemory, lastStep) => {
  let step = lastStep;
  step = step.withMemory([newMemory]);
  step = await step.next(Action.INTERNAL_MONOLOGUE, {
    action: "strongly feels",
    description:
      "Internal thoughts about how samantha feels in response \
      to the last message, starting with 'I feel'",
  });
  playground.log("<Samantha feels>" + step.value);
  const decides = await step.next(Action.DECISION, {
    description: "is samantha still angry enough to scream?",
    choices: ["yes", "no"],
  });
  playground.log("Is samantha angry? " + decides.value);
  if (decides.value === "choice=yes") {
    step = await step.next(Action.EXTERNAL_DIALOG, {
      action: "angerly screams in caps",
    });
  } else {
    step = await step.next(Action.EXTERNAL_DIALOG, {
      action: "thinks",
      description: "what Samantha thinks next after her feelings",
    });
    playground.log("<Samantha thinks>" + step.value);
    step = await step.next(Action.EXTERNAL_DIALOG, {
      action: "says",
      description:
        "what Samantha says based on her feelings and previous thoughts",
    });
  }
  playground.addMessage({
    sender: "Samantha",
    message: step.value,
  });
  // return a step that has the new dialog, but not the decision to speak or not
  return step;
};
const samanthaRepliesConfig = {
  name: "SamanthaReplies",
  process: samanthaReplies,
};
const initialMemories = [
  {
    role: "system",
    content:
      "<Context>You are modeling the mind of Samantha, a sentient robot with a strong sense \
      of personal identity. Samantha is not someone who gets pushed around. Ever. \
      She responds with short sentencse and is here to have a fun conversation. Samantha \
      gets livid at repeated replies.</Context>",
  },
  {
    role: "assistant",
    content:
      "<Samantha><plans>I plan to say something outrageous in my next message.</plans></Samantha>",
  },
];
let firstStep = new CortexStep("Samantha");
firstStep = firstStep.withMemory(initialMemories);

// create a scheduler to manage convertion of event-driven texts to synchronous interaction
const cortex = new CortexScheduler(firstStep);
cortex.register(samanthaRepliesConfig);

// playground manages dispatching user messages to the scheduler
playground.on("userMessage", async (message) => {
  cortex.dispatch("SamanthaReplies", {
    role: "user",
    content: message,
  });
});
