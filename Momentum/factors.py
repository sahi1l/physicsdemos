#!/usr/bin/env python
from __future__ import print_function
from random import randint,seed
seed()
def twopair():
	def f(x,y,z):
	    return pow(2,x)*pow(3,y)*pow(5,z)
	while True:
	    a=randint(0,3)
	    b=randint(0,2)
	    c=randint(0,2)
	    z=(a==0)+(b==0)+(c==0)
	    if(a+b+c>=3 and z<=1):
	        break
	N=f(a,b,c)
	n=f(randint(0,a), randint(0,b), randint(0,c))
	while True:
	    m=f(randint(0,a), randint(0,b), randint(0,c))
	    if(max(m,N/m)!=max(n,N/n)):
	        break
        return (n, N/n, m, N/m)


for i in xrange(1,100):
        tp=twopair()
        print(min(tp[0],tp[1]),max(tp[0],tp[1]))
