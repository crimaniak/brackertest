package org.kulentsov.brackertest.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;


// Experiments with selenium FindBy
public class CalculatorPage extends Page 
{
	@FindBy(how = How.TAG_NAME, using = "h1")
	@CacheLookup
	public WebElement header;

	@FindBy(how = How.NAME, using = "convert")
	@CacheLookup
	public WebElement convert;

	@FindBy(how = How.NAME, using = "design")
	@CacheLookup
	public WebElement design;

	
	
	public CalculatorPage(WebDriver webDriver) 
	{
		super(webDriver);
	}

}
