#!/usr/bin/env python3
import math
hpi = math.pi/2

for m in range(4):
    for n in range(4):
        print(m,n,f"{math.cos(m*hpi):.1f}\t{math.cos(n*hpi):.1f}\t{math.cos((m+n-1)*hpi):.1f}",sep='\t')
#        num = math.sin(m*hpi)+math.sin(n*hpi)
#        den = math.cos(m*hpi)+math.cos(n*hpi)
#        if den==0: result="inf"
#        else: result=num/den
#        print(m,n,result,sep='\t')
        
