package org.kulentsov.brackertest;

class ffRange extends FieldToFill
  {
	  public final float minValue;
	  public final float maxValue;

	  ffRange(String name, float minValue, float maxValue) 
	  {
		  super(name);
		  this.minValue = minValue;
		  this.maxValue = maxValue;
	  }

	  @Override
	  String getRandomValue() 
	  {
		  return String.valueOf(minValue+Math.random()*(maxValue-minValue));
	  }
  }