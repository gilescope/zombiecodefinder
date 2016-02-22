# zombiecodefinder
Find Zombie code in your svn repo

##What is Zombie code?

I was shocked to see how well maintained and upgraded dead code can get. I assumed naievly that dead code was just that - dead. 
Sure it got in the way a bit and was better off being deleted, but I assumed if it wasn't used, people wouldn't be maintaining it.

Of course, if you're new to a project and someone says upgrade X, you're going to find every reference to X and ensure it's upgraded. 
Alas not enough people question whether the code is actually used at all and can be removed safely.

Here's an overview of some of the reason Zombie Code is bad:
http://www.bitnative.com/2012/10/22/kill-the-zombies-in-your-code/


##How can you help me fight the zombie apocalypse?

Here's a snapshot of viewing subversion's codebase:

http://gilescope.github.io/zombiecodefinder/

The bits in blue are old and rarely changed. There be zombies, get a shovel and start dispatching them.


##How can I see the same for my codebase?

  1. svn log --with-all-revprops -v  --xml http://svn.apache.org/repos/asf/subversion/trunk > my.xml
  2. npm install
  3. npm start my.xml
  4. view index.html in the browser of your choice.
