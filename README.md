# 🤖+👱 SocialAGI

> Subroutines for AI Souls

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![Twitter](https://img.shields.io/twitter/url/https/twitter.com/socialagi.svg?style=social&label=Follow%20%40socialagi)](https://twitter.com/socialagi) [![](https://dcbadge.vercel.app/api/server/FCPcCUbw3p?compact=true&style=flat)](https://discord.gg/FCPcCUbw3p) [![Ceasefire Now](https://badge.techforpalestine.org/ceasefire-now)](https://techforpalestine.org/learn-more)

## 🤔 What is this?

**SocialAGI** offers developers clean, simple, and extensible abstractions for directing the cognitive processes of large language models (LLMs), steamlining the creation of more effective and engaging AI souls.

## 💡 Simple Example

```javascript
import { ChatMessageRoleEnum, CortexStep, externalDialog, internalMonologue } from "socialagi";
const step = new CortexStep("Elizabar").withMemory([
  {
    role: ChatMessageRoleEnum.System,
    content: "You are modeling the mind of Elizabar, a grumpy mideval merchant, trying to sell his last, rusted out, sword.",
  },
  {
    role: ChatMessageRoleEnum.User,
    content: "How goes, Elzi!",
  }
])
const feels = await step.next(internalMonologue("Elizabar ponders how he feels about this person.", "felt"))
// Elizabar felt:  Who is this person addressing me so casually? No respect for my name, not even a formal greeting. They must be one of those clueless young folk. Well, I suppose I'll tolerate their presence for now, but they better not waste my time.

const thought = await feels.next(internalMonologue("Elizabar thinks about how he could convince this person to buy his sword."))
console.log("Elizabar thought: ", thought.value)
// Elizabar thought:  This person seems eager to engage, but can they truly appreciate the value of what I possess? Selling this rusted old sword will not be an easy task. I must carefully craft my words to make it appear as if I'm doing them a tremendous favor by allowing them the opportunity to purchase it. Yes, that should pique their interest.

const { stream, nextStep } = await thought.next(externalDialog("Elizabar greets the person."), { stream: true })
console.log("Elizabar says: ", (await nextStep).value)
// Elizabar says:  Hmph, greetings to you, traveler. What brings you to this humble stall? Are you in search of a weapon? If so, you just might be in luck, for I have here the finest sword you'll find in all the land.
```

## 💫 AI Souls

**SocialAGI** aims to simplify the developer experience as much as possible in creating agentic and embodied chatbots called AI Souls, comprising thousands of linguistic instructions (managed by SocialAGI). Unlike traditional chatbots, these SocialAGI instructions will give digital souls personality, drive, ego, and will.

We are solving problems all the way across the AI souls stack, including:
- How do I create the most lifelike AI entity?
- How do I quickly host an AI soul?
- How do I manage dialog and cognitive memory?
- How do I get away from boring technical details and instead sculpt personalities?

## 📖 Repo structure

- [`/core`](./core) contains the library [`socialagi` NPM package source](https://www.npmjs.com/package/socialagi)
- [`/docs`](./docs) contains the documentation website for the project, running at [socialagi.dev](http://socialagi.dev)
- [`/memory`](./memory) contains the library [`@socialagi/memory` NPM package source](https://www.npmjs.com/package/@socialagi/memory)

## 🚀 Getting started

The easiest way to get started developing with `socialagi` is to explore the [documentation](http://socialagi.dev).

## 🧠 Documentation

Check out the full documentation at [socialagi.dev](http://socialagi.dev)!

## 👏 Contributing

If this project is exciting to you, check out the issues, open a pull request, or simply hangout in the [Social AGI Discord](https://discord.gg/BRhXTSmuMB)!

On the roadmap at a high level are:

- Minimal API surfaces for designing AI cognition
- New techniques to specify personality
- Ways to design the conversations that constitute an identity
- Coherent theory of mind behind AI cognition
- Ways to test and debug AI souls
