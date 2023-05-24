package org.kulentsov.brackertest;

class ffSelect extends FieldToFill
{
	public final String[] values;

	public ffSelect(String name, String... values) 
	{
		super(name);
		this.values = values;
	}

	@Override
	String getRandomValue() 
	{
		return values[(int) Math.floor(Math.random()*(values.length))];
	}
}