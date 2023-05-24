package org.kulentsov.brackertest;

import java.net.URL;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;

import ru.stqa.selenium.factory.AbstractWebDriverPool;
import ru.stqa.selenium.factory.LooseWebDriverPool;

/**
 * Base class for all the JUnit-based test classes
 */
public class JUnitTestBase {

	private static final String CHROMEDRIVER_EXE = "chromedriver.exe";
    private static final String IEDRIVER_EXE = "IEDriverServer.exe";
    private static final String FFDRIVER_EXE = "geckodriver.exe";

  protected static URL gridHubUrl;
  protected static String baseUrl;
  protected static String copyUrl;
  protected static Capabilities capabilities;

  protected static AbstractWebDriverPool pool;
  protected static WebDriver baseDriver;
  protected static WebDriver copyDriver;
//  protected WebDriver driver;

  @BeforeAll
  public static void loadConfig() throws Throwable {
    SuiteConfiguration config = new SuiteConfiguration();
    baseUrl = config.getProperty("site.url");
    copyUrl = config.getProperty("copy.url");
    
    if (config.hasProperty("grid.url") && !"".equals(config.getProperty("grid.url"))) {
      gridHubUrl = new URL(config.getProperty("grid.url"));
    }
    
    
    ChromeOptions options = new ChromeOptions();
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    
    capabilities = config.getCapabilities();
    pool = new LooseWebDriverPool();
    baseDriver = getDriver();
    copyDriver = getDriver();
  };

  @BeforeEach
  public void initDriver() throws Throwable {
  }
  
  @AfterAll
  public static void shutdown() {
	  baseDriver.close();
	  copyDriver.close();
  }

  protected static WebDriver getDriver() throws Throwable {
	    return pool.getDriver(gridHubUrl, capabilities);
  }

  // experiments with Chrome 
  private static ChromeDriver getDriver1() {
      ClassLoader classLoader = JUnitTestBase.class.getClassLoader();
      //String filePath = classLoader.getResource(CHROMEDRIVER_EXE).getFile();
      ChromeDriverService service = new ChromeDriverService.Builder()
              //.usingDriverExecutable(new File(filePath))
              .build();
      ChromeOptions options = new ChromeOptions();
      options.addArguments("--no-sandbox"); // Bypass OS security model, MUST BE THE VERY FIRST OPTION
      //options.addArguments("--headless");
      options.setExperimentalOption("useAutomationExtension", false);
      options.addArguments("start-maximized"); // open Browser in maximized mode
      options.addArguments("disable-infobars"); // disabling infobars
      options.addArguments("--disable-extensions"); // disabling extensions
      options.addArguments("--disable-gpu"); // applicable to windows os only
      options.addArguments("--disable-dev-shm-usage"); // overcome limited resource problems
      return new ChromeDriver(service, options);
  }


}
