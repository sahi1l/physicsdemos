#!/usr/bin/python
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
    result=[]
    t=0
    foundOne=True
    while(len(tmp)<8 and foundOne):
        foundOne=False
        t=t+1
        kn=tmp[:]
        R="" #R=[]
        for S in sets:
            val=solveTriangle(S,tmp)
            if(val):
                R+=str(val) #R+=[val]
                foundOne=True
                kn.append(val)
#                result[val]=t
        tmp=kn
        result+=[R]
    if(len(tmp)==8):
        return result
    else:
        return False

for I in combinations([1,2,3,4,5,6,7],3):
    L=list(I)+[8]
    sv=solve(L)
    if(sv):
        print("".join(map(str,L)),solve(L))
