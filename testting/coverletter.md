're absolutely right. Let me fix that:

Short DM Template:
Hey [Name],
I've been following [Company]'s work on [specific thing] and it got me thinking about some similar problems I've been working through.
I recently built AntiNode AI, a research platform that tries to tackle the hallucination issue in AI agents. Basically, most agent frameworks I tried (LangChain, etc.) would get stuck in loops or make things up when uncertain, so I experimented with a different approach.
The system asks the model to verify its own knowledge by calling tools when it's not confident. Like if it's unsure about a formula, it calls get_formula() first rather than guessing. Still iterating on it, but it's been working pretty well so far.
I noticed [Company] is working on [specific problem]. I've been dealing with similar challenges around [relevant experience], and I'd be curious to hear how you're approaching it.
Happy to share what I've learned if you're interested. Here's the live version: antinodeai.space
Ayush

Longer Version:
Hi [Name],
I've been following [Company]'s work on [specific thing] and wanted to reach out.
Over the past year, I've been building AntiNode AI, a collaborative research platform. The main problem I was trying to solve was hallucinations in multi-step AI reasoning. I kept running into issues where agent frameworks would either get stuck in their own logic or confidently make things up when they weren't sure.
My approach was to build a verification layer into the reasoning process. Instead of forcing the model to figure everything out at once, I let it identify gaps in its own knowledge and call specialized tools to fill them in. So if it's working on a physics problem and isn't sure about an equation, it can call get_formula() to verify before continuing.
It's still rough around the edges, but I'm seeing fewer hallucinations than with standard approaches. The architecture uses Node.js and PostgreSQL on the backend, React frontend, and integrates with Gemini for the LLM layer. I also added real-time collaboration with Socket.IO so multiple people can work on the same analysis.
Before this, I did some backend work at ExtendedLeafs optimizing WebSocket infrastructure and database queries. At NovaNectar, I worked on frontend modules and real-time notifications.
I'm mostly self-taught, which means I've probably made mistakes that someone with formal training wouldn't, but I've learned a lot by building things and breaking them.
I saw that [Company] is [specific thing they're working on]. The challenges around [specific technical problem] seem similar to what I've been dealing with, and I'd love to hear how you're thinking about it.
You can check out what I built at antinodeai.space if you're curious. Would be great to chat if you have time.
Thanks,
Ayush Gairola
ayushgairola@gmail.com
+91 81266 87562
