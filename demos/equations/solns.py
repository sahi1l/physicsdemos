#!/usr/bin/python
from __future__ import print_function
from itertools import combinations
sets=[[1,2,8],[2,3,4],[4,5,6],[6,7,8]];
def solveTriangle(set,known):
    tmp=set[:]
    for k in known:
        if(k in tmp):
            tmp.remove(k)
    if(len(tmp)==1):
        return tmp[0]
    return False;

def solve(known):
    tmp=known[:]
    result={}
    for k in known:
        result[k]=0
    t=0
    foundOne=True
    while(len(tmp)<8 and foundOne):
        foundOne=False
        t=t+1
        kn=tmp[:]
        for S in sets:
            val=solveTriangle(S,tmp)
            if(val):
                foundOne=True
                kn.append(val)
                result[val]=t
        tmp=kn
    if(len(tmp)==8):
        return result
    else:
        return False

def grid(res):
    print("  "+str(res[1])+"  ")
    print(" "+str(res[8])+" "+str(res[2])+" ")
    print(str(res[7])+"   "+str(res[3]))
    print(" "+str(res[6])+" "+str(res[4])+" ")
    print("  "+str(res[5])+"  ")
    print("")
for I in combinations([1,2,3,4,5,6,7],3):
    L=list(I)+[8]
    sv=solve(L)
    if(sv):
        grid(sv)
