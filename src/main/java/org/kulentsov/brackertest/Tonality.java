package org.kulentsov.brackertest;

public enum Tonality 
{
	G("G"), 
	Fsharp("F#"),
	F("F"), 
	E("E"), 
	Dsharp("D#"),
	D("D"),
	Csharp("C#"),
	C("C"),
	B("B"),
	Bb("Bb"),
	A("A"),
	LowGsharp("Low G#"),
	LowG("Low G"), 
	LowFsharp("Low F#"),
	LowF("Low F"), 
	LowE("Low E"), 
	LowEb("Low Eb"),
	LowD("Low D"),
	LowCsharp("Low C#"),
	LowC("Low C"),
	LowB("Low B"),
	BassBb("Bass Bb"),
	BassA("Bass A"),
	BassGsharp("Bass G#"), 
	BassG("Bass G"), 
	BassFsharp("Bass F#"),
	BassF("Bass F"), 
	BassE("Bass E"), 
	BassEb("Bass Eb"),
	BassD("Bass D"),
	BassCsharp("Bass C#"),
	BassC("Bass C");

	public final String label;

	Tonality(String label) {
        this.label = label;
	}
	
}
