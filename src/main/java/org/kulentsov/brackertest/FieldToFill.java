package org.kulentsov.brackertest;

abstract class FieldToFill
{
  public final String name;

  FieldToFill(String name)
  {
	  this.name = name;
  }
  abstract String getRandomValue();
}