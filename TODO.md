# TODO

Add the creation of video files of each session to the session ender.

The initial proof of concept can simply pull the events for the session from
Clickhouse, write them to a JSON file named after the session ID and invoke
rrvideo on the file to output a similarly named webm file which can be written
to a directory exposed from outside the container as a volume.

To scale this, a separate task could pick up the JSON files (in parallel if
necessary) and convert them.
