#!/usr/bin/env python3
N=10
q=6
from random import shuffle
code=["|"]*(N-1)+["*"]*q
shuffle(code)
bin=0
cntL=0
for x in code:
    if x=='|':
        bin+=1
    elif x=='*':
        cntL+=1
    if bin>=5:
        break
print(''.join(code),cntL)
