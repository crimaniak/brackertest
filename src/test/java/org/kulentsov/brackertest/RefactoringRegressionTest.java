package org.kulentsov.brackertest;

import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

class RefactoringRegressionTest extends JUnitTestBase {

	public static int testAmount = 10;
	
	private List<FieldToFill> getFieldsToFill() {
		
		return List.of(
			new ffSelect("convert", "mm", "inches"), 
			new ffSelect("design", "Whistle", "Flute"),
			new ffSelect("key", Stream.of(Tonality.values()).map(t -> t.label+"\u00A0").toArray(String[]::new)),
			new ffSelect("intonation","Just", "HB-trad","ET"),
			//new ffRange("OuterDiam",12.0f, 30.0f),
			//new ffRange("wall", 0.5f, 3f),
			//new ffRange("diamEmb1", 2f, 12f),
			//new ffRange("diamEmb2", 4f, 12f),
			//new ffRange("embWall", 0.5f, 3f),
			new ffRange("tipLength",5f, 30f)
		);
	}
	
	private List<String> fieldsToCheck = List.of(
			"OuterDiam", "wall", "diamEmb1", "diamEmb2", "embWall","bore2", "resultEmb", "resultLength","optimumBore",
			"freq1","note1","centsdiff1","diam1","result1","spacing1","cutoff1",
			"freq2","note2","centsdiff2","diam2","result2","spacing2","cutoff2",
			"freq3","note3","centsdiff3","diam3","result3","spacing3","cutoff3",
			"freq4","note4","centsdiff4","diam4","result4","spacing4","cutoff4",
			"freq5","note5","centsdiff5","diam5","result5","spacing5","cutoff5",
			"freq6","note6","centsdiff6","diam6","result6","spacing6","cutoff6",
			"freq7","note7","centsdiff7","diam7","result7","spacing7","cutoff7",
			"freqEnd","noteEnd","centsdiffEnd","bore"
			);

//	private HomePage homepage;

	@BeforeEach
	public void initPageObjects() {
		//homepage = PageFactory.initElements(baseDriver, HomePage.class);
	}

	// Set value of form control. Not very good way to do this, but still better than sendKeys()
	private void setValue(WebElement e, String value,  WebDriver d)
	{
		((JavascriptExecutor)d).executeScript("arguments[0].value='"+value+"';arguments[0].dispatchEvent(new Event('change'));", e);
	}
	
	// Compare original copy of the calculator and modified (refactored) copy
	@Test
	void compareCopies() throws InterruptedException {
		// create two drivers for two browser window instances
		baseDriver.get(baseUrl);
		copyDriver.get(copyUrl);
		
		// Ensure we have correct header for the page
		Stream.of(baseDriver, copyDriver)
			.forEach(driver -> Assertions.assertEquals("Whistle and Flute Hole Calculator", driver.findElement(By.tagName("h1")).getText(),"Unexpected page header"));

		List<FieldToFill> fieldsToFill = getFieldsToFill();

		// Monte-Carlo testing
		for (var i = 0; i < testAmount; ++i) {
			// generate and fill fields in base and copy
			fieldsToFill.forEach(f -> {
				String value = f.getRandomValue();
				System.out.println(f.name+"="+value.toString());
				setValue(baseDriver.findElement(By.name(f.name)),value, baseDriver);
				setValue(copyDriver.findElement(By.name(f.name)),value, copyDriver);
			});
			// compare base and copy results
			fieldsToCheck.forEach(name -> {
				Assertions.assertEquals(
						baseDriver.findElement(By.name(name)).getAttribute("value"),
						copyDriver.findElement(By.name(name)).getAttribute("value"),
						"Field "+name+" has incorrect value"
						);
			});
		}

	}

}
