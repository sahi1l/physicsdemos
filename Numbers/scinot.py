#!/usr/bin/python
#coding: utf-8
import random
a=random.randint(1,9)
b=random.randint(0,9)
t=random.randint(1,10)
S=str(a)+"."+str(b)+"e-"+str(t)
fmt="%."+str(t+1)+"f"
N=fmt % float(S)
pfx="u"; mul=1e6
if(t<4 or (t==4 and random.randint(0,1))):
    pfx="m"; mul=1e3
if(t>7 or (t==7 and random.randint(0,1))):
    pfx="n"; mul=1e9
M=str(float(S)*mul)+pfx
print(N,S,M)
